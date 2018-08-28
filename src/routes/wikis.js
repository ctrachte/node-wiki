const express = require("express");
const router = express.Router();
const validation = require("./validation");
const collaborationController = require("../controllers/collaborationController");
const wikiController = require("../controllers/wikiController");
const helper = require("../auth/helpers");

router.post("/wikis/:id/addCollab", helper.ensureAuthenticated, validation.validateCollabs, collaborationController.addCollab);
router.post("/wikis/:wikiId/deleteCollab/:id",  helper.ensureAuthenticated, collaborationController.destroy);

router.get("/wikis", wikiController.index);
router.get("/publicWikis",  helper.ensureAuthenticated,
 wikiController.publicIndex);

router.get("/wikis/new",  helper.ensureAuthenticated, wikiController.new);
router.get("/wikis/newPrivate",  helper.ensureAuthenticated, wikiController.newPrivate);

router.post("/wikis/create",
  helper.ensureAuthenticated,
  validation.validateWikis,
  wikiController.create);
router.post("/wikis/createPrivate",
  helper.ensureAuthenticated,
  validation.validateWikis,
  wikiController.createPrivate);

router.get("/wikis/:id",  helper.ensureAuthenticated, wikiController.show);
router.post("/wikis/:id/destroy", helper.ensureAuthenticated, wikiController.destroy);
router.get("/wikis/:id/edit", helper.ensureAuthenticated, wikiController.edit, collaborationController.show);
router.post("/wikis/:id/update",  helper.ensureAuthenticated, validation.validateWikis, wikiController.update);
router.post("/wikis/:id/changePrivacy", helper.ensureAuthenticated, wikiController.changePrivacy);

module.exports = router;
