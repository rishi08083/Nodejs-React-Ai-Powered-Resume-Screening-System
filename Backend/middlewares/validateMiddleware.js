const { body, validationResult } = require("express-validator");
const dns = require("dns").promises; // Ensure DNS module is imported
const db = require("../models");

exports.validateRegister = [
  body("name")
    .trim()
    .customSanitizer((value) => value.replace(/\s+/g, " "))
    .matches(/^[A-Za-z]+( [A-Za-z]+)?$/)
    .withMessage(
      "Name must contain only alphabets and a single space between first and last name. No numbers or special characters allowed."
    )
    .custom((value) => {
      if (value.length < 2) {
        throw new Error("Name must be at least 2 characters long");
      }
      if (value.length > 50) {
        throw new Error("Name must be less than 50 characters long");
      }
      return true;
        }),

      body("email")
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Valid email is required")
        .custom((value) => {
      if (value.length < 8) {
        throw new Error("Email must be at least 8 characters long");
      }
      if (value.length > 100) {
        throw new Error("Email must be less than 100 characters long");
      }
      if (/\.{2,}/.test(value)) {
        throw new Error("Email cannot contain consecutive dots");
      }
      if (/\.com\.com/.test(value)) {
        throw new Error("Email cannot contain consecutive '.com' in domain.");
      }
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(?!com\.com)([a-zA-Z]{2,})(\.[a-zA-Z]{2,})?$/.test(value)) {
        throw new Error("Please provide a valid email domain");
      }
      return true;
        })
        .custom(async (email) => {
      const domain = email.split("@")[1];
      const trustedDomains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "promactinfo.com"
      ];
      if (trustedDomains.includes(domain)) {
        return true;
      }
      try {
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          throw new Error("Email domain is not valid or cannot receive emails");
        }
      } catch (error) {
        throw new Error("Email domain is not valid or cannot receive emails");
      }
      return true;
        })
        .custom(async (email) => {
      const existingUser = await db.Users.findOne({ where: { email } });
      if (existingUser) {

        if(existingUser.is_verified) throw new Error("Email already exists");
        
        else await existingUser.destroy();
      }
      return true;
        }),

      body("password")
        .isLength({ min: 8 })
        .trim()
        .withMessage("Password must be at least 8 characters long")
        .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9])/
        )
        .withMessage(
      "Password must contain at least 1 uppercase letter, 1 special character, and 1 number"
        ),

      (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: { details: errors.array() },
      });
    }
    next();
  },
];

exports.validateLogin = [
  body("email").trim().toLowerCase().isEmail().withMessage("Valid email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: { details: errors.array() },
      });
    }
    next();
  },
];
