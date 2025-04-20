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
    const { email } = req.body;
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
      text: `Dear Recruiter,\n\nWe regret to inform you that your request has been rejected.\n\nMessage: ${message}\n\nBest regards,\nYour Company`,
    };

    // Replace with your email and password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
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
