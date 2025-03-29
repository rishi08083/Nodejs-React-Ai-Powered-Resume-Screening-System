const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Access Denied: No token provided",
      error: { details: "Authorization token is missing" },
    });
  }

  try {
    const verified = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = verified; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({
      status: "error",
      message: "Invalid or Expired Token",
      error: { details: err.message },
    });
  }
};
