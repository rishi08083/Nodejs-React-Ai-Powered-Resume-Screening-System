const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

const viewRecruiterReq = async (req, res) => {
  try {
    const users = await db.Users.findAll({
      where: { is_active: "pending" },
      attributes: ["id", "name", "email", "role"],
    });
    res.status(200).json({
      message: `Recruiter Requests Displayed`,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res
        .status(404)
        .json({ message: "Recruiter not found or already approved" });
    }

    res.status(200).json({ message: "Recruiter approved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ message: "Recruiter not found " });
    }

    res.status(200).json({ message: "Recruiter Rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    viewRecruiterReq,
    approveRecruiterReq,
    rejectRecruiterReq
}