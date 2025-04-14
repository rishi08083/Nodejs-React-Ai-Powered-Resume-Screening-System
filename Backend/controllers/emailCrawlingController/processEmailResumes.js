const {
  S3Client,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto");
const db = require("../../models");
const { generateToken } = require("../../utils/tokenGeneration");

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

const parseResumes = async (file, job_id, user_id) => {
  try {
      const errors = [];
      let aiEndpoint;
      const fileExtension = path.extname(file.fileName).toLowerCase();

      // Determine the AI backend endpoint based on file type
      if (fileExtension === ".pdf") {
        aiEndpoint = "/parse_pdf_resume";
      } else if ([".doc", ".docx"].includes(fileExtension)) {
        aiEndpoint = "/parse_doc_resume";
      } else if ([".png", ".jpg", ".jpeg"].includes(fileExtension)) {
        aiEndpoint = "/parse_image_resume";
      } else {
        errors.push({ file: file.fileName, error: "Unsupported file type" });
      }

      try {
        // Generate a token for authentication
        const token = generateToken();
        const aiResponse = await axios.post(
          `${process.env.AI_BACKEND_URL}${aiEndpoint}?file_key=${file.fileName}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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

        for (let exp of aiResponse.data.data.experience) {
          const startDate = exp.start_date ? new Date(exp.start_date) : null;
          const endDate = exp.end_date ? new Date(exp.end_date) : null;
          const isValidDate = (date) => date instanceof Date && !isNaN(date);

          await candidate.createExperience({
            company_names: exp.company,
            job_titles: exp.job_title,
            start_date: isValidDate(startDate) ? startDate : null,
            end_date: isValidDate(endDate) ? endDate : null,
          });
        }

        for (let edu of aiResponse.data.data.education) {
          await candidate.createEducation({
            institution_name: edu?.College || "Unknown Institution",
            degree: edu?.Degree || "Unknown Degree",
            start_date: edu?.start_date || null,
            end_date: edu?.end_date || null,
          });
        }
      } catch (error) {
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          // console.error({
          //   status: errorData.status || "error",
          //   message: errorData.message || "API request failed",
          //   error: {
          //     details: errorData.error?.details || error.message,
          //   },
          //   code: errorData.code || error.response.status, // Include the code from response
            
          // });
          // console.error(`Error parsing file ${file.fileName}:`, error.message);
          errors.push({ file: file.fileName, error: errorData.message });
        } else {
          console.error({
            status: "error",
            message: "Network or unknown error",
            error: {
              details: error.message,
            },
            code: null,
          });
        };
      }
      // }
  
      return errors;
    } catch (error) {
      console.log(`Error during parsing: ${error}`);
      return [{ error: "An unexpected error occurred during parsing." }];
    }
};

const processAndUploadResume = async (file, job_id, user_id) => {
  const fileName = generateFileName(file.filename);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.content,
    ContentType: file.contentType,
  };

  await s3.send(new PutObjectCommand(params));
  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;

  await db.UnparsedResume.create({
    user_id,
    resume_url: fileUrl,
    status: "uploaded",
    is_deleted: false,
  });

  await parseResumes({ fileName, fileUrl }, job_id, user_id);
};

const extractJobTitle = async (parsed) => {
  const subject = parsed.subject || '';
  const body = (parsed.text || '').trim();

  // Extract job title
  let jobTitle = null;

  // Try extracting from subject
  const subjectMatch = subject.match(/Job Application:\s*(.+)/i);
  if (subjectMatch) {
    jobTitle = subjectMatch[1].trim();
  } 
  // else if (body.length > 0 && body.length <= 150) {
  //   // Fallback: if body is short, assume it's the job title
  //   jobTitle = body;
  // }

  const job = await db.Jobs.findOne({
    where: {title: jobTitle},
    raw: true
  });

  return job.id;

}


module.exports = { 
  processAndUploadResume,
  extractJobTitle
};
