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

    res.status(200).json({
      status: "success",
      message: "Files uploaded successfully",
      data: { documents: uploadedFiles },
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
