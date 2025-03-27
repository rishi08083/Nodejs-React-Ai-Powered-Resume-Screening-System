exports.getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // return the user details
    return res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: req.user.id,
        name: req.user.user.name,
        role: req.user.user.role,
        email: req.user.user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
