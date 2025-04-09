const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const googleOAuthRegister = async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log(req.body);
    
    const existingUser = await db.Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(200).json({
        status: "success",
        message: "User already registered",
        data: { user: existingUser },
      });
    }

    // Generate password and hash it
    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = await db.Users.create({
      name,
      email,
      role: "recruiter",
      is_active: "pending",
      is_verified: true,
      password_hash: hashedPassword,
    });

    // Send the password to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail", // or any other
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ATS_Promact" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to ATS Recruiment",
      html: `
        <p>Hi ${name},</p>
        <p>Your account has been created using Google OAuth.</p>
        <p>Here is your generated password: <strong>${generatedPassword}</strong></p>
        <p>Use this password to log in via the standard login if needed. You can change it later from your profile.</p>
        <p>Thank you!<br/>ATS Recruiment Team</p>
      `,
    });

    return res.status(201).json({
      status: "success",
      message: "Google user registered. Awaiting admin approval.",
      data: { user: newUser },
    });
  } catch (err) {
    console.error("Error in Google OAuth registration:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
module.exports = { googleOAuthRegister };