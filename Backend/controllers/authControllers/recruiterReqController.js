const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

const viewRecruiterReq = async (req, res) => {
  try {
    const users = await db.Users.findAll({
      where: { is_verified: true, is_active: "pending"},
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
    const { email } = req.body;
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
  viewRecruiterReq,
  approveRecruiterReq,
  rejectRecruiterReq,
};
