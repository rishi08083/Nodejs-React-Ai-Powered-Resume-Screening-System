const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        error: { details: "No user exists with the provided email address" },
      });
    }

    //const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000;
    // 4 digit random number in string
    const token = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    user.token = token;
    user.token_expires = tokenExpiry;
    await user.save();

    //const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

      const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your password. Use the OTP below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2c3e50;">${token}</span>
          </div>
          <p>This OTP is valid for <strong>1 hour</strong>. Do not share this code with anyone.</p>
          <p>If you did not request this, you can ignore this email.</p>
          <br />
          <p>Regards,</p>
          <p><strong>ATS Team</strong></p>
          <hr style="margin: 40px 0; border-top: 2px solid #d8a31a;" />
          <div style="background-color: #fff; padding: 20px; color: #000; border-radius: 8px;">
            <p style="font-size: 14px; margin: 0 0 10px;">
              <strong>Website:</strong> 
              <a href="https://rs-fe.rishi.publicvm.com" style="color: #d8a31a; text-decoration: none;">ats-recruitment.com</a>
            </p>
            <div style="margin-top: 15px; padding-top: 10px; border-radius: 4px;">
              <img 
                src="https://www.theatsteam.com/wp-content/uploads/2025/01/ATS_background.jpg" 
                alt="ATS Logo" 
                style="width: 300px; height: auto; display: block;" 
              />
            </div>
          </div>
          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 20px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    };

    
    res.status(200).json({
      status: "success",
      message: "Password reset email sent successfully",
      data: { email },
    });
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request",
      error: { details: error.message },
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await db.Users.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token",
        error: {
          details: "The provided token is either invalid or has expired",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password_hash = hashedPassword;
    user.token = null;
    user.token_expires = null;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
      data: { email: user.email },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while resetting the password",
      error: { details: error.message },
    });
  }
};

module.exports = {
  resetPassword,
  forgetPassword,
};
