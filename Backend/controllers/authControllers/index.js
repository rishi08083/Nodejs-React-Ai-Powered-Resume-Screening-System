const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

const adminRegister = async (req, res) => {
  try {
    const { name, email, password, apikey } = req.body;
    if (apikey === "Niket") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.Users.create({
        name,
        email,
        password_hash: hashedPassword,
        role: "admin",
        is_active: "accepted",
      });

      res.status(201).json({
        status: "success",
        message: "Admin registered successfully",
        data: { user },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Not Authorized",
        error: { details: "Invalid API key" },
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: error.message },
    });
  }
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const recruiterRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const tokenExpiry = Date.now() + 10 * 60 * 1000;
    // 4 digit random number in string
    const token = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      text: `Here is your OTP: ${token}`,
      html: `<p>Enter this OTP ${token} to verify your email.</p>`,
    };
    await transporter.sendMail(mailOptions);

    const user = await db.Users.create({
      name,
      email,
      password_hash: hashedPassword,
      role: "recruiter",
      token: token,
      token_expires: tokenExpiry
    });

    res.status(201).json({
      status: "success",
      message: "Recruiter registered successfully",
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: error.message },
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.Users.findOne({ where: { 
      email,
      is_verified: true
    }});

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid credentials",
        error: { details: "User not found or incorrect email" },
      });
    }

    if (user.is_active === "accepted") {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          status: "error",
          message: "Invalid credentials",
          error: { details: "Incorrect password" },
        });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, user: user },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        data: { token },
      });
    } else {
      res.status(401).json({
        status: "error",
        message: "Unauthorized Access",
        error: { details: "User is not active" },
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: error.message },
    });
  }
};

module.exports = {
  adminRegister,
  recruiterRegister,
  userLogin,
};
