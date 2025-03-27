exports.authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden: Insufficient Permissions",
        error: { details: "You do not have the required role to access this resource." },
      });
    }
    next();
  };
};
