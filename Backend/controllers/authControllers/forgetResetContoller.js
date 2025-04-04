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

    //const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000;
    // 4 digit random number in string
    const resetToken = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    user.resetToken = resetToken;
    user.resetTokenExpires = tokenExpiry;
    user.is_verified = false;
    await user.save();

    //const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Here is your otp: ${resetToken}`,
      html: `<p>Enter this OTP ${resetToken} to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "Password reset email sent successfully",
      data: { email },
    });
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
    user.resetToken = null;
    user.resetTokenExpires = null;
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

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await db.Users.findOne({
      where: {
        email: email,
        reset_token: otp,
        reset_token_expires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or expired token",
      });
    }
    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      data: { email: user.email },
    });

    user.reset_token = null;
    user.reset_token_expires = null;
    user.is_verified = true;
    await user.save();

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while verifying the OTP",
      error: { details: error.message },
    });
  }
};

module.exports = {
  resetPassword,
  forgetPassword,
  verifyOtp,
};
