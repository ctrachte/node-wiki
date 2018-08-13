const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");

module.exports = {
  new(req, res, next){
    const authorized = new Authorizer(req.user).new();
    if(authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You are not authorized to create new wikis");
      res.redirect("/wikis");
    }
  },
  create(req, res, next){
    const authorized = new Authorizer(req.user).create();
    if(authorized) {
      let newWiki= {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if(err){
          res.redirect(500, "/wikis/new");
        } else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {

      req.flash("notice", "You are not authorized to create a new wiki.");
      res.redirect("/wikis");
    }
  },
  show(req, res, next){
    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {
        res.render("wikis/show", {wiki});
      }
    });
  },
  destroy(req, res, next){
    wikiQueries.deleteWiki(req, (err, deletedRecordsCount) => {
      if(err){
        res.redirect(500, `/wikis/${req.params.id}`)
      } else {
        res.redirect(303, "/")
      }
    });
  },
  edit(req, res, next){

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, "/");
      } else {

        const authorized = new Authorizer(req.user, wiki).edit();

        if(authorized){
          res.render("wikis/edit", {wiki});
        } else {
          req.flash("You are not authorized to edit this wiki.")
          res.redirect(404, "/");
        }
      }
    });
  },
  update(req, res, next){
    wikiQueries.updateWiki(req, req.body, (err, wiki) => {
      if(err || wiki == null){
        res.redirect(404, `/wikis/${req.params.id}/edit`);
      } else {
        res.redirect(`/wikis/${req.params.id}`);
      }
    });
  }
}
