const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

const viewPendingRecruiterReq = async (req, res) => {
  try {
    const users = await db.Users.findAll({
      where: { is_verified: true, is_active: "pending" },
      attributes: ["id", "name", "email", "role", "is_active"],
    });
    res.status(200).json({
      status: "success",
      message: "Recruiter Requests Displayed",
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve recruiter requests",
      error: { details: error.message },
    });
  }
};

const viewAcceptedRecruiter = async (req, res) => {
  try {
    const users = await db.Users.findAll({
      where: { is_verified: true, is_active: "accepted", role: "recruiter" },
      attributes: ["id", "name", "email", "role", "is_active"],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      message: "Accepted Recruiters Displayed",
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve accepted recruiters",
      error: { details: error.message },
    });
  }
};

const viewRejectedRecruiter = async (req, res) => {
  try {
    const users = await db.Users.findAll({
      where: { is_verified: true, is_active: "rejected" },
      attributes: ["id", "name", "email", "role", "is_active"],
    });
    res.status(200).json({
      status: "success",
      message: "Rejected Recruiters Displayed",
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve rejected recruiters",
      error: { details: error.message },
    });
  }
};

const approveRecruiterReq = async (req, res) => {
  try {
    const { email, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recruiter Request Accepted",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="text-align: center; color: #333;">Recruiter Request Approved</h2>
  <p>Dear Recruiter,</p>
  <p>We are pleased to inform you that your recruiter registration request has been <strong>approved</strong>. You can now log in and start managing your job postings and candidates.</p>
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
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: "error",
          message: "Failed to send rejection email",
          error: { details: error.message },
        });
      } else {
        console.log("Email sent:", info.response);
      }
    });

    const [updatedRows] = await db.Users.update(
      { is_active: "accepted" },
      { where: { email } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Recruiter not found or already approved",
        error: {
          details: "No matching recruiter found with the provided email",
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Recruiter approved successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to approve recruiter",
      error: { details: error.message },
    });
  }
};

const rejectRecruiterReq = async (req, res) => {
  try {
    const { email, message } = req.body;
    console.log("Rejecting recruiter with email:", email);
    console.log("Message:", message);

    // mail message
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recruiter Request Rejected",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="text-align: center; color: #333;">Recruiter Request Rejected</h2>
          <p>Dear Recruiter,</p>
          <p>We regret to inform you that your request has been rejected.</p>
          ${message ? `<p><strong>Reason:</strong> ${message}</p>` : ""}
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

    // Replace with your email and password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          status: "error",
          message: "Failed to send rejection email",
          error: { details: error.message },
        });
      } else {
        console.log("Email sent:", info.response);
      }
    });

    const [updatedRows] = await db.Users.update(
      { is_active: "rejected" },
      { where: { email } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Recruiter not found",
        error: {
          details: "No matching recruiter found with the provided email",
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Recruiter rejected successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to reject recruiter",
      error: { details: error.message },
    });
  }
};

module.exports = {
  viewPendingRecruiterReq,
  viewAcceptedRecruiter,
  viewRejectedRecruiter,
  approveRecruiterReq,
  rejectRecruiterReq,
};
