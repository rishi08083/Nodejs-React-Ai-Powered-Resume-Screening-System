exports.getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
        error: { details: "User is not authenticated" },
      });
    }
    // Return the user details
    return res.status(200).json({
      status: "success",
      message: "User details fetched successfully",
      data: {
        user: {
          id: req.user.id,
          name: req.user.user.name,
          role: req.user.user.role,
          email: req.user.user.email,
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
