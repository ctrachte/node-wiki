module.exports = {
  init(app){
    const mockAuth = require("../../spec/support/mock-auth.js");
    const staticRoutes = require("../routes/static");
    const userRoutes = require("../routes/users");
    const wikiRoutes = require("../routes/wikis");


    if(process.env.NODE_ENV == "test") {
      mockAuth.fakeIt(app);
    };

    app.use(staticRoutes);
    app.use(userRoutes);
    app.use(wikiRoutes);

  }
}
