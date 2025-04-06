const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = () => {
  const token = jwt.sign({ user: "nodejs-server" }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};
