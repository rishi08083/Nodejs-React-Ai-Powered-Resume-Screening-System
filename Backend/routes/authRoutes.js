const express = require("express");
const router = express.Router();

const {
  register,
  login,
  adminRegister,
  forgetPassword,
  resetPassword,
  viewRecruiterReq,
  approveRecruiterReq,
  rejectRecruiterReq,
} = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validateMiddleware");

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/adminregister", adminRegister);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.get("/view-recruiter-req", viewRecruiterReq);
router.post("/approve-recruiter-req", approveRecruiterReq);
router.delete("/reject-recruiter-req", rejectRecruiterReq);

module.exports = router;
