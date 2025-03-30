const express = require("express");
const router = express.Router();

const {
  adminRegister,
  recruiterRegister,
  userLogin,
} = require("../controllers/authControllers");

const {
  viewRecruiterReq,
  approveRecruiterReq,
  rejectRecruiterReq,
} = require("../controllers/authControllers/recruiterReqController");

const {
  forgetPassword,
  resetPassword,
  verifyOtp,
} = require("../controllers/authControllers/forgetResetContoller");

const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validateMiddleware");

router.post("/register", validateRegister, recruiterRegister);
router.post("/login", validateLogin, userLogin);
router.post("/adminregister", adminRegister);

router.get("/view-recruiter-req", viewRecruiterReq);
router.post("/approve-recruiter-req", approveRecruiterReq);
router.delete("/reject-recruiter-req", rejectRecruiterReq);

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtp);

module.exports = router;
