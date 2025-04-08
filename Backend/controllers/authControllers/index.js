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
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Email Verification</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering. To complete your sign up, please verify your email address by entering the OTP below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50;">${token}</span>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>Promact Team</strong></p>
          <hr style="margin: 40px 0; border-top: 2px solid #d8a31a;" />
          <div style="background-color: #111; padding: 20px; color: #fff; border-radius: 8px;">
            <p style="font-size: 14px; margin: 0 0 10px;"><strong>Website:</strong> <a href="https://promactinfo.com" style="color: #d8a31a; text-decoration: none;">promactinfo.com</a></p>
            <div style="margin-top: 15px; background-color: #fff; padding: 10px; border-radius: 4px;">
              <img src='https://promact.hiringbull.com/Home/GetImage?handler=CompanyLogo&companyId=305' alt="Promact Tagline" style="max-width: 100%; height: auto;" />
            </div>
          </div>
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };
    
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

    await transporter.sendMail(mailOptions);
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
