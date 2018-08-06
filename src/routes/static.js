const express = require("express");
const router = express.Router();
const staticController = require("../controllers/staticController");
const aboutController = require("../controllers/aboutController");


router.get("/", staticController.index);
router.get("/about", aboutController.about);


module.exports = router;
