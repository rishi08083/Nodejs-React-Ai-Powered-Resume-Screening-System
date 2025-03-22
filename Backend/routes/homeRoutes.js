const express = require("express");
const { getHomeController } = require("../controllers/homeController");

const router = express.Router();

router.get("/", getHomeController);

module.exports = router;
