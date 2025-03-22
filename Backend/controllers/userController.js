const jwt = require("jsonwebtoken");
const db = require("../models");

exports.getUserDetails = async (req, res) => {
  try {
    // if jwt token is not present in the request, return 401 from cookie
    console.log(req.cookies);
    const token = req.cookies.jwtToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find the user with the decoded id
    const user = await db.Users.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // return the user details
    return res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
