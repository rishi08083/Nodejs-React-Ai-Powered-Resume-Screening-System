// controllers/authControllers/profileController.js

const { Users } = require("../../models");
const bcryptjs = require("bcryptjs"); // Make sure this is installed

// Get user profile details including joined date
exports.getProfileDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        error: { details: "User is not authenticated" },
      });
    }

    // Find user by ID using Sequelize
    const user = await Users.findByPk(req.user.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        error: { details: "User not found in database" },
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: err.message },
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        error: { details: "User is not authenticated" },
      });
    }

    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: { details: "Name and email are required" },
      });
    }

    // Find the user
    const user = await Users.findByPk(req.user.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        error: { details: "User not found in database" },
      });
    }

    // Check if email already exists (excluding current user)
    if (email !== user.email) {
      const existingUser = await Users.findOne({ where: { email } });
      
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          error: { details: "Email already in use" },
        });
      }
    }

    // Update user
    user.name = name;
    user.email = email;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: err.message },
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        error: { details: "User is not authenticated" },
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: { details: "Current password and new password are required" },
      });
    }

    // Get user with password
    const user = await Users.findByPk(req.user.user.id);
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        error: { details: "User not found in database" },
      });
    }

    // Verify current password - note you're using password_hash in your model
    const isMatch = await bcryptjs.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        error: { details: "Current password is incorrect" },
      });
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: { details: err.message },
    });
  }
};