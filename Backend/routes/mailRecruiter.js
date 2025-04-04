const express = require('express');
const router = express.Router();

const { mailRecruiter } = require('../controllers/mailRecruiterController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/mail-recruiter', authMiddleware, mailRecruiter);

module.exports = router;