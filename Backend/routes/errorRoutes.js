const express = require('express');
const router = express.Router();

const ErrorController = require('../controllers/defaultControllers/errorController');

router.use(ErrorController.error404);

module.exports = router;