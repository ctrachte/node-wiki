const legit = require("legit");

module.exports = {
  validateWikis(req, res, next) {

    if(req.method === "POST") {

      req.checkBody("title", "must be at least 2 characters in length").isLength({min: 2});
      req.checkBody("body", "must be at least 10 characters in length").isLength({min: 10});
    }

    const errors = req.validationErrors();

    if (errors) {

      req.flash("error", errors);
      return res.redirect(303, req.headers.referer)
    } else {
      return next();
    }
  },
  validateCollabs(req, res, next) {

    if(req.method === "POST") {

     legit(req.body.email)
       .then(result => {
         if (result.isValid===false) {req.flash("error", "Please choose a valid email.");}
       })
       .catch(err => console.log(err));
    }

    const errors = req.validationErrors();

    if (errors) {

      req.flash("error", errors);
      return res.redirect(303, req.headers.referer)
    } else {
      return next();
    }
  },
  validateUsers(req, res, next) {
    if(req.method === "POST") {

      req.checkBody("password", "must be at least 6 characters in length").isLength({min: 6});
      req.checkBody("passwordConfirmation", "must match password provided").optional().matches(req.body.password);

     legit(req.body.email)
       .then(result => {
         if (result.isValid===false) {req.flash("error", "Please choose a valid email.");}
       })
       .catch(err => console.log(err));
    }

    let errors = req.validationErrors();

    if (errors) {
      req.flash("error", errors);
      return res.redirect(req.headers.referer);
    } else {
      return next();
    }
  }
}
