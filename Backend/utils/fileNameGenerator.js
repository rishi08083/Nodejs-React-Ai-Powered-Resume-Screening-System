const crypto = require("crypto");
const path = require("path");

exports.generateFileName = (originalName) => {
  const ext = path.extname(originalName);
  // Get base name without extension and sanitize it (remove special chars)
  const baseName = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, "_");
  // Add random key for uniqueness while keeping original name
  const uniqueKey = crypto.randomBytes(6).toString("hex");
  return `${baseName}_${uniqueKey}${ext}`;
};
