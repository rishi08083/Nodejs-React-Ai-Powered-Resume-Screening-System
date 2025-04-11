const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const db = require("../../models");
const googleOAuthRegister = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const existingUser = await db.Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email already registered. Try logging in.",
      });
    }
    console.log(`⚠️ Duplicate Google OAuth registration attempt for: ${email}`);

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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Welcome to ATS Recruitment</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been created using Google OAuth. Below is your generated password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2c3e50;">${generatedPassword}</span>
          </div>

          <p>You can use this password to log in via the standard login if needed. It's recommended to change this password later from your profile settings.</p>
          <p><strong>Note:</strong> Your account is currently pending admin approval.</p>
          <br />
          <p>Regards,</p>
          <p><strong>ATS Recruitment Team</strong></p>

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

          <p style="font-size: 11px; color: #aaa; text-align: center; margin-top: 20px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
`,
    });

    return res.status(201).json({
      status: "success",
      message: "Google user registered. Awaiting admin approval.",
      data: { user: newUser },
    });
  } catch (err) {
    console.error("Error in Google OAuth registration:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};
module.exports = { googleOAuthRegister };
