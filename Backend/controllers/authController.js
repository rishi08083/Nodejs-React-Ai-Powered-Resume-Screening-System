const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');



const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.Users.create({
      name,
      email,
      password_hash: hashedPassword,
      role: "recruiter",
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.Users.findOne({ where: { email } });
  
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, user: user },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `logged in successfully`,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminRegister = async (req, res) => {
  try {
    const { name, email, password, apikey } = req.body;
    console.log(req.body);
    if (apikey === "Niket") {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.Users.create({
        name,
        email,
        password_hash: hashedPassword,
        role: "admin",
      });

      res.status(201).json({ message: "Admin registered successfully", user });
    } else {
      res.status(500).json("Not Authorized");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

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

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpires = tokenExpiry;
    await user.save();

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await db.Users.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password_hash = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, adminRegister, resetPassword, forgetPassword };
