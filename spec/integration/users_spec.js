const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;

describe("routes : users", () => {

  beforeEach((done) => { // before each context
    this.wiki;   // define variables and bind to context
    this.user;

    sequelize.sync({ force: true }).then(() => {  // clear database
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe",
        role:"member"
      })
      .then((user) => {
        this.user = user;
        Wiki.create({
          title: "Cool New Wiki",
          body: "There is a lot of them",
          isPrivate:false,
          userId: this.user.id
        })
        .then((res) => {
          this.wiki = res;
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      });
    });
  });

  describe("GET /users/sign_up", () => {

    it("should render a view with a sign up form", (done) => {
      request.get(`${base}sign_up`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign up");
        done();
      });
    });

  });
  describe("GET /users/sign_in", () => {

    it("should render a view with a sign in form", (done) => {
      request.get(`${base}sign_in`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign in");
        done();
      });
    });

  });
  describe("GET /users/:id", () => {
    // before each test in admin user context, send an authentication request
    // to a route we will create to mock an authentication request
     beforeEach((done) => {
      User.findOne({ where: {id: this.user.id} })
      .then((user) => {
        request.get({         // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate as admin user
            userId: user.id,
            email: user.email
          }
        },
          (err, res, body) => {
            done();
          }
        );
      });
     });
    it("should present a list of wikis a user has created", (done) => {

      request.get(`${base}${this.user.id}`, (err, res, body) => {
        expect(body).toContain("Cool New Wiki");
        expect(body).toContain("starman@tesla.com");
        done();
      });

    });
  });
  describe("GET /users/showUpgrade", () => {
    // before each test in admin user context, send an authentication request
    // to a route we will create to mock an authentication request
     beforeEach((done) => {
      User.findOne({ where: {id: this.user.id} })
      .then((user) => {
        request.get({         // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate member user
            userId: user.id,
            email: user.email
          }
        },
          (err, res, body) => {
            done();
          }
        );
      });
     });
    it("should present an upgrade view", (done) => {

      request.get(`${base}showUpgrade`, (err, res, body) => {
        expect(body).toContain("Upgrade to a premium account today!");
        done();
      });

    });
  });
  describe("POST /users/:id/upgrade", () => {
    // before each test in admin user context, send an authentication request
    // to a route we will create to mock an authentication request
     beforeEach((done) => {
      User.findOne({ where: {id: this.user.id} })
      .then((user) => {
        request.get({         // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate as user
            userId: user.id,
            email: user.email
          }
        },
          (err, res, body) => {
            done();
          }
        );
      });
     });
     it("should upgrade the user's account role to member", (done) => {

       request.post(`${base}${this.user.id}/upgrade`, (err, res, body) => {
         User.findOne({where: {id: this.user.id}})
         .then((user) => {
           expect(user).not.toBeNull();
           expect(user.role).toBe("premium");
           expect(user.id).not.toBeNull();
           done();
         })
         .catch((err) => {
           console.log(err);
           done();
         });
       });

     });
  });
  describe("POST /users/:id/downgrade", () => {
    // before each test in admin user context, send an authentication request
    // to a route we will create to mock an authentication request
     beforeEach((done) => {
      User.findOne({ where: {id: this.user.id} })
      .then((user) => {
        request.get({         // mock authentication
          url: "http://localhost:3000/auth/fake",
          form: {
            role: user.role,     // mock authenticate as a premium user
            userId: user.id,
            email: user.email
          }
        },
          (err, res, body) => {
            done();
          }
        );
      });
     });
    it("should downgrade the user's account role to member", (done) => {

      request.post(`${base}${this.user.id}/downgrade`, (err, res, body) => {
        User.findOne({where: {id: this.user.id}})
        .then((user) => {
          expect(user).not.toBeNull();
          expect(user.role).toBe("member");
          expect(user.id).not.toBeNull();
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });

    });
  });
});
