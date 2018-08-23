const express = require("express");
const router = express.Router();
const validation = require("./validation");
const collaborationController = require("../controllers/collaborationController");
const helper = require("../auth/helpers");

router.get("/wikis/:id/collab", collaborationController.edit);
router.post("/wikis/:id/addCollab", collaborationController.update);

module.exports = router;
