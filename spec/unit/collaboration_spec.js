const sequelize = require("../../src/db/models/index").sequelize;
const Collaboration = require("../../src/db/models").Collaboration;
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;


describe("Collaboration", () => {

  beforeEach((done) => {
    this.collaboration;
    this.user;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user; //store the user

        Wiki.create({
          title: "Expeditions to Alpha Centauri",
          body: "A compilation of reports from recent visits to the star system.",
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki; //store the wiki

          Collaboration.create({
            wikiId: this.wiki.id,
            email: this.user.email,
            userId: this.user.id
          })
          .then((collaboration) => {
            this.collaboration = collaboration; //store the collaboration
            done();
          })
        })
      })
    });
  });
  describe("#create()", () => {

    it("should create a collaboration object", (done) => {
        Collaboration.create({
          wikiId: this.wiki.id,
          email: this.user.email,
          userId: this.user.id
        })
        .then((collaboration) => {

          expect(collaboration.wikiId).toBe(1);
          expect(collaboration.email).toBe("starman@tesla.com");
          expect(collaboration.userId).toBe(1);
          done();

        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
      it("should not create a collaboration with missing title, body, or assigned topic", (done) => {
        Collaboration.create({
          userId: 1
        })
        .then((collaboration) => {

         // the code in this block will not be evaluated since the validation error
         // will skip it. Instead, we'll catch the error in the catch block below
         // and set the expectations there

          done();

        })
        .catch((err) => {
          expect(err.message).toContain("Collaboration.email cannot be null");
          done();
        })
      });

  });

  describe("#setUser()", () => {

    it("should associate a collaboration and a user together", (done) => {

      User.create({
        email: "ada@example.com",
        password: "password"
      })
      .then((newUser) => {

        expect(this.collaboration.userId).toBe(this.user.id);

        this.collaboration.setUser(newUser)
        .then((collaboration) => {

          expect(this.collaboration.userId).toBe(newUser.id);
          done();

        });
      })
    });

  });
  describe("#getUser()", () => {

    it("should return the associated user", (done) => {

      this.collaboration.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      });

    });

  });
});
