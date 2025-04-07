const db = require("../../models");
const { Op,} = require("sequelize");

const verifyToken = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await db.Users.findOne({
        where: {
          email: email,
          token: otp,
          token_expires: { [Op.gt]: Date.now() },
        },
      });
  
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }
      res.status(200).json({
        status: "success",
        message: "OTP verified successfully",
        data: { email: user.email },
      });
  
      user.token = null;
      user.token_expires = null;
      user.is_verified = true;
      await user.save();
  
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "An error occurred while verifying the OTP",
        error: { details: error.message },
      });
    }
};

module.exports = {
    verifyToken
}