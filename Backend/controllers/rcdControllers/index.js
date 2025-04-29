const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const crypto = require("crypto");
const db = require("../../models/index.js");
const { generateFileName } = require("../../utils/fileNameGenerator");

require("dotenv").config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload Role Clarity Documents API
exports.uploadRCD = async (req, res) => {
  try {
    if (!req.file || req.file.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No files uploaded",
        error: { details: "No files were provided in the request" },
      });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid file type",
        error: {
          details: `File type ${req.file.mimetype} is not allowed. Only PDF, DOC, and DOCX files are permitted.`,
        },
      });
    }

    const fileName = generateFileName(req.file.originalname);
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    await s3.send(new PutObjectCommand(params));

    const rcd_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("RCD URL:", rcd_url);
    const isUpdate = await db.Jobs.update(
      { is_rcd_uploaded: true, rcd_url }, // Values to update
      { where: { id: parseInt(req.body.jobId) } } // Where
    );

    if (isUpdate[0] === 0) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
        error: { details: "The job ID provided does not exist" },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Role Clarity Documents uploaded successfully",
      data: { documents: [rcd_url] },
    });
  } catch (error) {
    console.error("Error uploading RCDs:", error);
    res.status(500).json({
      status: "error",
      message: "Role Clarity Document upload failed",
      error: { details: error.message },
    });
  }
};

// Get Role Clarity Documents API
exports.getRCD = async (req, res) => {
  try {
    const jobId = req.params.jobId; // Assuming jobId is passed as a route parameter
    console.log("Job ID:", jobId);
    const job = await db.Jobs.findOne({
      where: { id: jobId },
      attributes: ["rcd_url"],
    });

    if (!job || !job.rcd_url) {
      return res.status(404).json({
        status: "error",
        message: "Role Clarity Document not found",
        error: { details: "No document found for the provided job ID" },
      });
    }

    const fileKey = job.rcd_url.split("/").pop(); // Extract the file key from the URL

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL valid for 1 hour

    res.status(200).json({
      status: "success",
      message: "Role Clarity Document retrieved successfully",
      data: { documents: [signedUrl] },
    });
  } catch (error) {
    console.error("Error retrieving Role Clarity Document:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve Role Clarity Document",
      error: { details: error.message },
    });
  }
};
