const express = require("express");
const router = express.Router();

const {
  adminRegister,
  recruiterRegister,
  userLogin,
} = require("../controllers/authControllers");

const {
  viewPendingRecruiterReq,
  viewAcceptedRecruiter,
  viewRejectedRecruiter,
  approveRecruiterReq,
  rejectRecruiterReq,
} = require("../controllers/authControllers/recruiterReqController");

const {
  forgetPassword,
  resetPassword,
} = require("../controllers/authControllers/forgetResetContoller");

const {
  verifyToken
} = require('../controllers/authControllers/verifyToken');

const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validateMiddleware");

const {
  googleOAuthRegister
} = require("../controllers/authControllers/googleAuthController");

const {
  googleOAuthLogin
} = require("../controllers/authControllers/googleOAuthLogin");


router.post("/register", validateRegister, recruiterRegister);
router.post("/login", validateLogin, userLogin);
router.post("/adminregister", adminRegister);

router.get("/view-recruiter-req", viewPendingRecruiterReq);
router.get("/view-accepted-recruiters", viewAcceptedRecruiter);
router.get("/view-rejected-recruiters", viewRejectedRecruiter);
router.post("/approve-recruiter-req", approveRecruiterReq);
router.delete("/reject-recruiter-req", rejectRecruiterReq);

router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

router.post("/verify-token", verifyToken);

router.post("/google-oauth-register", googleOAuthRegister);
router.post("/google-oauth-login", googleOAuthLogin);

module.exports = router;
