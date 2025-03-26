const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op, where } = require("sequelize");

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
        is_active: "accepted",
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

const recruiterRegister = async (req, res) => {
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

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.Users.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.is_active === "accepted") {
      const isMatch = await bcrypt.compare(password, user.password_hash);
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
        token
      });
    } else {
      res.status(401).json({ message: `Unauthorized Access` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
    adminRegister,
    recruiterRegister,
    userLogin
}