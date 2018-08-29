const collaborationQueries = require("../db/queries.collaborations.js");
const wikiQueries = require("../db/queries.wikis.js");
const userQueries = require("../db/queries.users.js");
const Authorizer = require("../policies/wiki");

module.exports = {

  show(req, res, next){
    collaborationQueries.getAllCollaborations((err, collaborations) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        res.render("collaborations/edit", {collaborations});
      }
    });
  },
  addCollab(req, res, next){

    userQueries.getUserByEmail(req.body.email, (err, user) => {

      let wikiId = req.params.id;
      let userId;
      let email = req.body.email;

      if(err || user == null){

        req.flash("notice", "That user could not be found!");
        res.redirect(`/wikis/${req.params.id}/edit`);

      } else if (user.id === req.user.id) {

        req.flash("notice", "You cannot add yourself!");
        res.redirect(`/wikis/${req.params.id}/edit`);

      } else {

        userId = user.id;

        let collaboration = {
          wikiId:wikiId,
          userId:userId,
          email:email
        };
        wikiQueries.getWiki(req.params.id, req.user.id, (err, wiki) => {
          const authorized = new Authorizer(req.user, wiki).destroy();
          if (authorized) {
            collaborationQueries.addCollaboration(collaboration, (err, collaboration) => {
              if(err || collaboration == null){
                req.flash('notice', err);
                res.redirect(`/wikis/${req.params.id}/edit`);
              } else {
                req.flash("notice", `${user.email} added as a collaborator.`);
                res.redirect(`/wikis/${req.params.id}/edit`);
              }
            });
          } else {
            req.flash("notice", "You must be the creator of this wiki to add collaborators.")
            res.redirect(`/wikis/${req.params.id}/edit`);
          }
        });
      }
    });
  },
  destroy(req, res, next){
    collaborationQueries.deleteCollaboration(req, (err, deletedRecordsCount) => {
      if(err){
        res.redirect(`/wikis/${req.params.wikiId}/edit`);
      } else {
        req.flash("notice", "Collaborator removed.");
        res.redirect(`/wikis/${req.params.wikiId}/edit`);
      }
    });
  }
}
