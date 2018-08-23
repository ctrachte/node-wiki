const collaborationQueries = require("../db/queries.collaborations.js");
const wikiQueries = require("../db/queries.wikis.js");
const userQueries = require("../db/queries.users.js");
const Authorizer = require("../policies/collaboration");

module.exports = {

  edit(req, res, next){
    collaborationQueries.getAllCollaborations((err, collaborations) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        res.render("collaborations/edit", {collaborations});
      }
    });
  },
  udpate(req, res, next){
    let wikiId;
    let userId;
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        wikiId = null;
      } else {
        wikiId = wiki.id;
      }
    });
    userQueries.getUserByEmail(req.body.email, (err, user) => {
      if(err || user == null){
        userId = null;
      } else {
        userId = user.id;
      }
    });
    if (wikiId && userId) {
      let collaboration = {
        wikiId:wikiId,
        userId:userId
      };
      collaborationQueries.addCollaboration(collaboration, (err, collaboration) => {
        if(err || collaboration == null){
          res.redirect(404, `/wikis/${req.params.id}/edit`);
        } else {
          res.redirect(`/wikis/${req.params.id}/collab`);
        }
      });
    } else {
      req.flash("notice", "That user could not be found!");
      res.redirect(`/wikis/${req.params.id}/collab`);
    }

  },
  // destroy(req, res, next){
  //   wikiQueries.deleteWiki(req, (err, deletedRecordsCount) => {
  //     if(err){
  //       res.redirect(500, `/wikis/${req.params.id}`)
  //     } else {
  //       res.redirect(303, "/")
  //     }
  //   });
  // }
  // update(req, res, next){
  //   wikiQueries.updateWiki(req, req.body, (err, wiki) => {
  //     if(err || wiki == null){
  //       res.redirect(404, `/wikis/${req.params.id}/edit`);
  //     } else {
  //       res.redirect(`/wikis/${req.params.id}`);
  //     }
  //   });
  // }
}
