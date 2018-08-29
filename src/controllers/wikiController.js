const wikiQueries = require("../db/queries.wikis.js");
const Authorizer = require("../policies/wiki");
const Emoji = require('markdown-it-emoji');
const Markdown = require('markdown-it')({
  linkify: true,
  typographer: true})
  .use(Emoji);
Markdown.renderer.rules.table_open = function(tokens, idx) {
      return '<table class="table">';
};
const collaborationQueries = require("../db/queries.collaborations.js");

module.exports = {
  index(req, res, next){
    const authorized = new Authorizer(req.user)._isPremium();

    if(authorized) {
      wikiQueries.getAllWikis((err, wikis) => {
        if(err){
          res.redirect(500, "static/index");
        } else {
          res.render("wikis/index", {wikis});
        }
      })
    } else {
      req.flash("notice", "You are not authorized to view private wikis");
      res.redirect("/");
    }
  },

  publicIndex(req, res, next){
    wikiQueries.getPublicWikis(req.user.id, (err, wikis) => {
      if(err){
        res.redirect(500, "static/index");
      } else {
        res.render("wikis/index", {wikis});
      }
    })
  },

  new(req, res, next){
    const authorized = new Authorizer(req.user).new();
    if(authorized) {
      res.render("wikis/new");
    } else {
      req.flash("notice", "You are not authorized to create new wikis");
      res.redirect("/wikis");
    }
  },

  newPrivate(req, res, next){
    const authorized = new Authorizer(req.user)._isPremium();
    if(authorized) {
      res.render("wikis/newPrivate");
    } else {
      req.flash("notice", "You are not authorized to create new private wikis");
      res.redirect("/");
    }
  },

  create(req, res, next){
    const authorized = new Authorizer(req.user).create();
    if(authorized) {
      let newWiki= {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private:false
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

  createPrivate(req, res, next){
    const authorized = new Authorizer(req.user)._isPremium();
    if(authorized) {
      let newWiki= {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private:true
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if(err){
          res.redirect(500, "/wikis/newPrivate");
        } else {
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to create a private wiki.");
      res.redirect("/wikis");
    }
  },

  show(req, res, next){
    wikiQueries.getWiki(req.params.id, req.user.id, (err, wiki) => {
      const authorized = new Authorizer(req.user, wiki, wiki.collaborators).edit();

      if(authorized){
        if(err || wiki === null){
          req.flash("notice", "Wiki not found!");
          res.redirect("/");
        } else {
          wiki.body = Markdown.render(wiki.body);
          res.render("wikis/show", {wiki});
        }
      } else {
        req.flash("notice", "You are not authorized to view this wiki.")
        res.redirect(`/`);
      }
    });
  },
  destroy(req, res, next){
    wikiQueries.getWiki(req.params.id, req.user.id, (err, wiki) => {
      const authorized = new Authorizer(req.user, wiki).destroy();
      if(authorized){
        wikiQueries.deleteWiki(req, (err, deletedRecordsCount) => {
          if(err){
            res.redirect(500, `/wikis/${req.params.id}`)
          } else {
            res.redirect(303, "/")
          }
        });
      } else {
        req.flash("notice", "You are not authorized to delete this wiki.")
        res.redirect(`/`);
      }
    });
  },
  edit(req, res, next){

    wikiQueries.getEditWiki(req.params.id, req.user.id, (err, wiki) => {

      const authorized = new Authorizer(req.user, wiki, wiki.collaborators).edit();

      if(authorized){
        res.render("wikis/edit", {wiki});
      } else {
        req.flash("notice", "You are not authorized to edit this wiki.")
        res.redirect(`/`);
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
  },
  changePrivacy(req, res, next){
    const authorized = new Authorizer(req.user)._isPremium();
    if(authorized) {
      wikiQueries.changePrivacy(req.params.id, (err, wiki) => {
        if(err){
          console.log(err);
          let message = {param: "", msg:err.errors[0].message};
          req.flash('error', message);
          res.redirect(`/wikis/${req.params.id}`);
        } else {
          req.flash("notice", "Privacy updated.");
          res.redirect(`/wikis/${req.params.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to update this user.");
      res.redirect(`/wikis/${req.params.id}`);
    }
  },
}
