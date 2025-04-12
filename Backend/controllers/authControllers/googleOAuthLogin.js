const db = require("../../models");
const jwt = require("jsonwebtoken");

const googleOAuthLogin = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db.Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not registered. Please sign up first.",
      });
    }

    if (user.is_active !== "accepted") {
      return res.status(403).json({
        status: "error",
        message: "Your account is not approved by admin yet.",
      });
    }

    const token = jwt.sign(
      { id: user.id, user: user },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      data: { token },
    });
  } catch (error) {
    console.error("Error in Google OAuth login:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { googleOAuthLogin };
