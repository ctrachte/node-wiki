module.exports = {
  init(app){
    const mockAuth = require("../../spec/support/mock-auth.js");
    const staticRoutes = require("../routes/static");


    if(process.env.NODE_ENV == "test") {
      mockAuth.fakeIt(app);
    };

    app.use(staticRoutes);

  }
}
