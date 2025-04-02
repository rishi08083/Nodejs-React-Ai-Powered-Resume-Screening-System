const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
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
      uploadedFiles.push({ fileName, fileUrl, mimeType: file.mimetype }); // Added mimeType
    }

    const unparsedResumes = uploadedFiles.map((file) => ({
      user_id: req.user.id,
      resume_url: file.fileUrl,
      status: "uploaded",
      is_deleted: false,
    }));

    await db.UnparsedResume.bulkCreate(unparsedResumes);
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

exports.getResume = async (req, res) => {
  try {
    const candidateId = req.params.candidateId; // Assuming candidateId is passed as a route parameter
    const candidate = await db.Candidates.findByPk(candidateId, {
      attributes: ["resume_url"],
    });

    if (!candidate || !candidate.resume_url) {
      return res.status(404).json({
        status: "error",
        message: "Resume Document not found",
        error: { details: "No document found for the provided candidate" },
      });
    }

    const fileKey = candidate.resume_url.split("/").pop(); // Extract the file key from the URL

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour

    res.status(200).json({
      status: "success",
      message: "Resume Document retrieved successfully",
      data: { resume_url: signedUrl },
    });
  } catch (error) {
    console.error("Error retrieving Resume:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve Resume Document",
      error: { details: error.message },
    });
  }
};

const parseResumes = async (uploadedFiles, job_id, user_id) => {
  try {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      let aiEndpoint;
      const fileExtension = path.extname(file.fileName).toLowerCase();

      // Determine the AI backend endpoint based on file type
      if (fileExtension === ".pdf") {
        aiEndpoint = "/parse_pdf_resume";
      } else if (fileExtension === ".doc" || fileExtension === ".docx") {
        aiEndpoint = "/parse_doc_resume";
      } else if (
        ".png" == fileExtension ||
        ".jpg" == fileExtension ||
        ".jpeg" == fileExtension
      ) {
        aiEndpoint = "/parse_image_resume";
      } else {
        console.log(`Unsupported file type: ${fileExtension}`);
        continue;
      }
      let flag = false;
      // AI Parsing Request
      const aiResponse = await axios
        .post(
          `${process.env.AI_BACKEND_URL}${aiEndpoint}?file_key=${file.fileName}`
        )
        .catch(function (error) {
          flag = true;
          if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data.detail);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log("Error", error.message);
          }
          return;
        });
      if (flag) {
        return;
      }
      console.log(JSON.stringify(aiResponse.data, null, 2), "    " + i);

      const candidate = await db.Candidates.create({
        name: aiResponse.data.data.name,
        email: aiResponse.data.data.email,
        phone_number: aiResponse.data.data.phone,
        resume_url: file.fileUrl,
        status: "parsed",
        job_id: job_id,
        user_id: user_id,
      });

      await candidate.createSkill({
        skill_names: aiResponse.data.data.skills,
      });

      for (let i = 0; i < aiResponse.data.data.experience.length; i++) {
        const experience = aiResponse.data.data.experience[i];
        const startDate = experience.start_date
          ? new Date(experience.start_date)
          : null;
        const endDate = experience.end_date
          ? new Date(experience.end_date)
          : null;

        const isValidDate = (date) => date instanceof Date && !isNaN(date);

        await candidate.createExperience({
          company_names: experience.company,
          job_titles: experience.job_title,
          start_date: isValidDate(startDate) ? startDate : null,
          end_date: isValidDate(endDate) ? endDate : null,
        });
      }

      for (let i = 0; i < aiResponse.data.data.education.length; i++) {
        await candidate.createEducation({
          institution_name:
            aiResponse.data.data.education[i]?.College || "Unknown Institution",
          degree: aiResponse.data.data.education[i]?.Degree || "Unknown Degree",
          start_date: aiResponse.data.data.education[i]?.start_date || null,
          end_date: aiResponse.data.data.education[i]?.end_date || null,
        });
      }
    }
  } catch (error) {
    console.log(`Error during parsing: ${error}`);
  }
};
