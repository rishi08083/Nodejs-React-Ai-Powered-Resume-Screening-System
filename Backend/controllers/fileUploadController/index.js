const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const crypto = require("crypto");
const db = require("../../models");
const { parseResumes } = require("./parseResume");
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

    // Upload all files to S3 in parallel
    const uploadPromises = req.files.map(async (file) => {
      const fileName = generateFileName(file.originalname);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(params));

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      return { fileName, fileUrl, mimeType: file.mimetype, originalName: file.originalname };
    });

    // Wait for all uploads to complete
    const uploadedFiles = await Promise.all(uploadPromises);

    // Create unparsed resume records in bulk (one DB operation)
    const unparsedResumes = uploadedFiles.map((file) => ({
      user_id: req.user.id,
      resume_url: file.fileUrl,
      status: "uploaded",
      is_deleted: false,
    }));

    await db.UnparsedResume.bulkCreate(unparsedResumes);
    
    const job_id = req.body.job_id;
    const user_id = req.user.id;

    // Process files in smaller batches for optimal performance
    const BATCH_SIZE = 10; // Adjust based on your server capacity
    const results = { errors: [], successfulUploads: [] };
    
    // Create batches of files
    const batches = [];
    for (let i = 0; i < uploadedFiles.length; i += BATCH_SIZE) {
      batches.push(uploadedFiles.slice(i, i + BATCH_SIZE));
    }
    
    // Process each batch in parallel
    const batchPromises = batches.map(async (batch) => {
      // Create a version of req.files that matches the batch
      const batchOriginalFiles = batch.map(file => {
        return { originalname: file.originalName };
      });
      
      // Process this batch
      const batchResult = await parseResumes(
        batch,
        job_id, 
        user_id,
        batchOriginalFiles
      );
      
      // Return batch results
      return batchResult;
    });
    
    // Collect all batch results
    const batchResults = await Promise.all(batchPromises);
    
    // Combine results from all batches
    batchResults.forEach(result => {
      results.errors.push(...result.errors);
      results.successfulUploads.push(...result.successfulUploads);
    });
    
    const { errors: parsingErrors, successfulUploads } = results;

    // Handle response based on results
    if (parsingErrors.length > 0 && successfulUploads.length === 0) {
      // Complete failure - all files failed to parse
      console.error("All parsing failed:", parsingErrors);
      return res.status(400).json({
        status: "error",
        message: "All files failed to parse",
        errors: parsingErrors,
      });
    } else if (parsingErrors.length > 0 && successfulUploads.length > 0) {
      // Partial success - some files parsed, some failed
      return res.status(207).json({
        status: "partial_success",
        message: "Some resumes were successfully parsed, others failed",
        data: {
          candidates: successfulUploads,
          files: uploadedFiles,
        },
        errors: parsingErrors,
      });
    }

    // All files successfully parsed
    res.status(200).json({
      status: "success",
      message: "Files uploaded and parsed successfully",
      data: {
        candidates: successfulUploads,
        files: uploadedFiles,
      },
    });
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
