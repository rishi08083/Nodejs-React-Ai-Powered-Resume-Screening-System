const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
const db = require("../../models");

require("dotenv").config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateFileName = (originalName) => {
  const ext = path.extname(originalName);
  return `${crypto.randomBytes(10).toString("hex")}${ext}`;
};

// Upload Multiple Resumes API
exports.uploadResumes = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded",
        error: { details: "No files were provided in the request" },
      });
    }

    if (req.files.length > 15) {
      return res.status(400).json({
        status: "error",
        message: "Too many files uploaded",
        error: { details: "A maximum of 15 files can be uploaded at once" },
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const fileName = generateFileName(file.originalname);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      uploadedFiles.push({ fileName, fileUrl });
    }

    const unparsedResumes = uploadedFiles.map((file) => ({
      user_id: req.user.id,
      resume_url: file.fileUrl,
      status: "uploaded",
      is_deleted: false,
    }));

    await db.UnparsedResume.bulkCreate(unparsedResumes);
    console.log(req.user);
    const job_id = req.body.job_id;
    const user_id = req.user.user.id;
    res.status(200).json({
      status: "success",
      message: "Files uploaded successfully",
      data: { files: uploadedFiles },
    });

    parseResumes(uploadedFiles, job_id, user_id);
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({
      status: "error",
      message: "File upload failed",
      error: { details: error.message },
    });
  }
};

const parseResumes = async (uploadedFiles, job_id, user_id) => {
  try {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const aiResponse = await axios.post(
        `${process.env.AI_BACKEND_URL}?file_key=${uploadedFiles[i].fileName}`,
        {
          // file_key :uploadedFiles[0].fileName
          // user_id: req.user.id,
        }
      );
      console.log(JSON.stringify(aiResponse.data, null, 2), "    " + i);

      const candidate = await db.Candidates.create({
        name: aiResponse.data.data.name,
        email: aiResponse.data.data.email,
        phone_number: aiResponse.data.data.phone,
        resume_url: uploadedFiles[i].fileUrl,
        status: "parsed",
        job_id: job_id,
        user_id: user_id,
      });

      await candidate.createSkill({
        skill_names: aiResponse.data.data.skills,
      });

      for (let i = 0; i < aiResponse.data.data.experience.length; i++) {
        await candidate.createExperience({
          company_name: aiResponse.data.data.experience[i].company,
          role: aiResponse.data.data.experience[i].job_title,
          start_date: aiResponse.data.data.experience[i].start_date,
          end_date: aiResponse.data.data.experience[i].end_date,
        });
      }

      for (let i = 0; i < aiResponse.data.data.education.length; i++) {
        await candidate.createEducation({
          institution_name: aiResponse.data.data.education[i],
        });
      }
    }
  } catch (error) {
    console.log(`Error during parsing: ${error}`);
  }
};
