const express = require("express");
const Router = express();

const multer = require("multer");

const s3fileUpload = require("../controllers/fileUploadController");

// Multer Setup for File Upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// upload job api

const auth = require("../middlewares/authMiddleware");

// File Upload API
Router.post(
  "/upload-resume",
  auth.authMiddleware,
  upload.array("resume-files", 10),
  (req, res, next) => {
    s3fileUpload.uploadResumes(req, res).catch(next); // Pass errors to the error-handling middleware
  }
);

module.exports = Router;
