const express = require("express");
const { getHomeController } = require("../controllers/defaultControllers/homeController");

const router = express.Router();

router.get("/", getHomeController);

module.exports = router;
