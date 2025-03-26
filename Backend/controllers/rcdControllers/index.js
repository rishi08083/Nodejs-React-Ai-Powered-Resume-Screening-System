const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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

// Upload Role Clarity Documents API
exports.uploadRCDs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
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

    for (const file of req.files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid file type",
          error: {
            details: `File type ${file.mimetype} is not allowed. Only PDF, DOC, and DOCX files are permitted.`,
          },
        });
      }
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

      // await s3.send(new PutObjectCommand(params));

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      uploadedFiles.push({ fileName, fileUrl });
    }

    const rcdMetadata = uploadedFiles.map((file) => ({
      user_id: 1,
      document_url: file.fileUrl,
      document_name: file.fileName,
      uploaded_at: new Date(),
    }));

     await db.Jobs.update(
      { rcd_uploaded: true }, // Values to update
      { where: { jobId: req.body.jobId } } // Where 
    );

    res.status(200).json({
      status: "success",
      message: "Role Clarity Documents uploaded successfully",
      data: { files: uploadedFiles },
    });
  } catch (error) {
    console.error("Error uploading RCDs:", error);
    res.status(500).json({
      status: "error",
      message: "RCD upload failed",
      error: { details: error.message },
    });
  }
};

// Get Role Clarity Documents API
exports.getRCDs = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available in the request object
    const rcds = await db.RoleClarityDocument.findAll({
      where: { user_id: userId, is_deleted: false },
      attributes: ["id", "document_name", "document_url", "uploaded_at"],
    });

    if (rcds.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No Role Clarity Documents found",
        error: { details: "No documents are available for the current user" },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Role Clarity Documents retrieved successfully",
      data: { documents: rcds },
    });
  } catch (error) {
    console.error("Error retrieving RCDs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve Role Clarity Documents",
      error: { details: error.message },
    });
  }
};
