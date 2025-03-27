const express = require("express");
const Router = express();

const multer = require("multer");
const rcdUploadController = require("../controllers/rcdControllers");

// Multer Setup for File Upload
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 10 }, // Restrict to a maximum of 10 files
});

// RCD Upload API
Router.post("/upload-rcd", upload.single("rcd"), (req, res, next) => {
  rcdUploadController.uploadRCD(req, res).catch(next);
});

// Get RCDs API
Router.get("/get-rcd/:jobId", (req, res, next) => {
  rcdUploadController.getRCD(req, res).catch(next);
});

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
