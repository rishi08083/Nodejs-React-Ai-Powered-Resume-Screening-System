const { body, validationResult } = require("express-validator");
// const Users = require("../models/users");
const db = require("../models");
exports.validateRegister = [
  body("name")
    // Trim the name to remove leading/trailing spaces
    .trim()
    .customSanitizer((value) => value.replace(/\s+/g, " ")) // Replace multiple spaces with a single space
    .matches(/^[A-Za-z]+( [A-Za-z]+)?$/)
    .withMessage(
      "Name must contain only alphabets and a single space between first and last name. No numbers or special characters allowed."
    )

    .custom((value) => {
      // Check name length
      if (value.length < 2) {
        throw new Error("Name must be at least 2 characters long");
      }

      if (value.length > 50) {
        throw new Error("Name must be less than 50 characters long");
      }

      return true;
    }),

  // Email Validation
  body("email")
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email is required")
    // Syntax validation
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
      if (!/\.[a-zA-Z]{2,}$/.test(value)) {
        throw new Error("Please provide a valid email domain");
      }
      return true;
    })
    // Domain validation (Checks if domain has an MX record)
    .custom(async (email) => {
      const domain = email.split("@")[1]; // Extract domain

      // Skip MX check for common email providers to avoid false negatives
      const trustedDomains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
      ];
      if (trustedDomains.includes(domain)) {
        return true; // Skip MX record check for known domains
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
    // Existing email check with trimmed and lowercased email
    .custom(async (email) => {
      const existingUser = await db.Users.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("password")
    .isLength({ min: 8 })
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
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
