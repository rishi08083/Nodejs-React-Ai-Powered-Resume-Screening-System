const express = require('express');
const router = express.Router();

const ErrorController = require('../controllers/error.controller');

router.use(ErrorController.error404);

module.exports = router;