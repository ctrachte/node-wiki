module.exports = {
  about(req, res, next){
    res.render("static/about", {title: "About Bloccit"});
  }
}
