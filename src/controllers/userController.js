const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const sgMail = require('@sendgrid/mail');
const stripe = require("stripe")("sk_test_U68vkbnSn99gjqwhOQHA7TBx");
const Authorizer = require("../policies/application");

module.exports = {

  signUp(req, res, next){
    res.render("users/signup");
  },

  create(req, res, next){
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation,
      membershipType: req.body.membershipType
    };
    userQueries.createUser(newUser, (err, user) => {
      if(err){
        let message = {param: "", msg:err.errors[0].message};
        req.flash('error', message);
        res.redirect("/users/sign_up");
      } else {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: newUser.email,
          from: 'nodewiki@examplemail.com',
          subject: 'Welcome to Node-Wiki!',
          text: 'Enjoy your free account!',
          html: '<strong>Create a basic wiki today!</strong>',
        };
        sgMail.send(msg);
        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You've successfully signed up!");
          res.redirect("/");
        })
      }
    });
  },

  signInForm(req, res, next){
    res.render("users/signin");
  },

  signIn(req, res, next){
    passport.authenticate("local")(req, res, function () {
      if(!req.user){
        req.flash("notice", "Sign in failed. Please try again.")
        res.redirect("/users/sign_in");
      } else {
        req.flash("notice", "You've successfully signed in!");
        res.redirect("/");
      }
    })
  },

  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  },

  show(req, res, next){
    const authorized = new Authorizer(req.user).new();
      if (authorized) {
      userQueries.getUser(req.params.id, (err, result) => {

        if(err || result.user === undefined){
          req.flash("notice", "No user found with that ID.");
          res.redirect("/");
        } else {
          res.render("users/show", {...result});
        }
      });
    } else {
      req.flash("notice", "You are not authorized to view this profile.");
      res.redirect("/");
    }
  },

  showUpgrade(req, res, next){
    const authorized = new Authorizer(req.user).showUpgrade();
    if (authorized) {
      userQueries.getUser(req.user.id, (err, result) => {

        if(err || result.user === undefined){
          req.flash("notice", err);
          res.redirect("/");
        } else {
          res.render("users/upgrade", {...result});
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that, or your account is already premium.");
      res.redirect("/");
    }
  },
  upgrade(req, res, next){
    const authorized = new Authorizer(req.user).upgradeAccount();
    if(authorized) {
      userQueries.changeRole(req.params.id, (err, user) => {
        if(err){
          let message = {param: "", msg:err.errors[0].message};
          req.flash('error', message);
          res.redirect("/");
        } else {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: req.body.stripeEmail,
            from: 'nodewiki@examplemail.com',
            subject: 'Welcome to Premium Node Wiki!',
            text: 'Enjoy creating private wikis...',
            html: '<strong>Create a private wiki today!</strong>',
          };
          sgMail.send(msg);
          req.flash("notice", "You've successfully upgraded to premium!");
          res.redirect("/");
        }
      });
    } else {
      req.flash("error", "You are not authorized to update this user.");
      res.redirect("/");
    }
  },

  downgrade(req, res, next){

    const authorized = new Authorizer(req.user).downgradeAccount();

    if(authorized) {
      userQueries.changeRole(req.params.id, (err, user) => {
        if(err){
          let message = {param: "", msg:err.errors[0].message};
          req.flash('error', message);
          res.redirect("/");
        } else {
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: req.user.email,
            from: 'nodewiki@examplemail.com',
            subject: 'You have downgraded your Node Wiki account',
            text: 'We are sad to see you go...',
            html: '<strong>The good news is, you can still create basic wikis free!</strong>',
          };
          sgMail.send(msg);
          req.flash("notice", "You've downgraded to member status...");
          res.redirect("/");
        }
      });
    } else {
      req.flash("error", "You are not authorized to downgrade this user.");
      res.redirect("/");
    }
  }
}
