const express = require("express");
const Router = express();

const multer = require("multer");
const fileUploadController = require("../controllers/fileUploadController");
const auth = require("../middlewares/authMiddleware");

// Multer Setup for File Upload
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  
    "image/jpeg",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, and JPEG images are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 15 }, // Restrict to a maximum of 15 files
});

Router.get(
  "/get-resume/:candidateId",
  auth.authMiddleware,
  async (req, res) => {
    try {
      await fileUploadController.getResume(req, res);
    } catch (err) {
      console.error("Error in getResume:", err);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: { details: err.message },
      });
    }
  }
);

// File Upload API
Router.post(
  "/upload-resume",
  auth.authMiddleware,
  upload.array("resume-files"),
  async (req, res, next) => {
    try {
      await fileUploadController.uploadResumes(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Error handling for file validation
Router.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message.startsWith("Invalid file type")
  ) {
    return res.status(400).json({
      status: "error",
      message: err.message,
      error: { details: err.message },
    });
  }
  next(err); // Pass other errors to the default error handler
});

module.exports = Router;
