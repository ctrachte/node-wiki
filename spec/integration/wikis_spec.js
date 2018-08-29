const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000";

const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const Collaboration = require("../../src/db/models").Collaboration;


describe("routes : wikis", () => {

  beforeEach((done) => { // before each context
    this.wiki;   // define variables and bind to context
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
          private:false,
          userId: this.user.id
        })
        .then((res) => {
          this.wiki = res;  // store resulting wiki in context
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      });
    });
  });

  describe("GET /publicWikis", () => {

   it("should respond with all public wikis", (done) => {
     request.get(`${base}/publicWikis`, (err, res, body) => {
       expect(err).toBeNull();
       expect(body).toContain("Wikis");
       expect(body).toContain("Cool New Wiki");
       done();
     });
   });

  });

  describe("GET /wikis", () => {

   it("should redirect to home, not render anything", (done) => {
     request.get(`${base}/wikis`, (err, res, body) => {
       expect(err).toBeNull();
       expect(res.statusCode).toBe(200);
       expect(body).not.toBe(null);
       done();
     });
   });

  });

  describe("admin user performing CRUD actions for Wikis", () => {

   // before each test in admin user context, send an authentication request
   // to a route we will create to mock an authentication request
    beforeEach((done) => {
     User.create({
       email: "wikiadmin@example.com",
       password: "jsjsjsjsjsjs",
       role: "admin"
     })
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
    describe("GET /wikis/new", () => {

      it("should render a new wiki form", (done) => {
        request.get(`${base}/wikis/new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Public Wiki");
          done();
        });
      });

    });
    describe("GET /wikis/newPrivate", () => {

      it("should render a new private wiki form", (done) => {
        request.get(`${base}/wikis/newPrivate`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Private Wiki");
          done();
        });
      });

    });
    describe("POST /wikis/create", () => {

       it("should create a new wiki and redirect", (done) => {
          const options = {
            url: `${base}/wikis/create`,
            form: {
              title: "snow",
              body: "White powdery substance that falls from the sky!",
              userId: this.user.id
            }
          };
          request.post(options,
            (err, res, body) => {

              Wiki.findOne({where: {title: "snow"}})
              .then((wiki) => {
                expect(wiki).not.toBeNull();
                expect(wiki.title).toBe("snow");
                expect(wiki.body).toBe("White powdery substance that falls from the sky!");
                done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
            }
          );
        });
        it("should not create a new wiki that fails validations", (done) => {
          const options = {
            url: `${base}/wikis/create`,
            form: {
              title: "a",
              body: "b"
            }
          };

          request.post(options,
            (err, res, body) => {

              Wiki.findOne({where: {title: "a"}})
              .then((wiki) => {
                  expect(wiki).toBeNull();
                  done();
              })
              .catch((err) => {
                console.log(err);
                done();
              });
            }
          );
        });
     });
    describe("POST /wikis/createPrivate", () => {

      it("should create a new Private wiki and redirect", (done) => {
         const options = {
           url: `${base}/wikis/createPrivate`,
           form: {
             title: "snow",
             body: "White powdery substance that falls from the sky!",
             userId: this.user.id
           }
         };
         request.post(options,
           (err, res, body) => {

             Wiki.findOne({where: {title: "snow"}})
             .then((wiki) => {
               expect(wiki).not.toBeNull();
               expect(wiki.title).toBe("snow");
               expect(wiki.body).toBe("White powdery substance that falls from the sky!");
               done();
             })
             .catch((err) => {
               console.log(err);
               done();
             });
           }
         );
       });
    });
    describe("GET /wikis/:id", () => {

     it("should render a view with the selected wiki", (done) => {
       request.get(`${base}/wikis/${this.wiki.id}`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Cool New Wiki");
         done();
       });
     });

    });
    describe("POST /wikis/:id/destroy", () => {

      it("should delete the wiki with the associated ID", (done) => {

        expect(this.wiki.id).toBe(1);

        request.post(`${base}/wikis/${this.wiki.id}/destroy`, (err, res, body) => {

          Wiki.findById(this.wiki.id)
          .then((wiki) => {
            expect(err).toBeNull();
            console.log(wiki);
            expect(wiki).toBeNull();
            done();
          })
        });

      });

    });
    describe("GET /wikis/:id/edit", () => {

      it("should render a view with an edit wiki form", (done) => {
        request.get(`${base}/wikis/${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("Cool New Wiki");
          done();
        });
      });

    });
    describe("POST /wikis/:id/update", () => {

       it("should return a status code 302", (done) => {
         request.post({
           url: `${base}/wikis/${this.wiki.id}/update`,
           form: {
             title: "Snowman Building Competition",
             body: "I love watching them melt slowly."
           }
         }, (err, res, body) => {
           expect(res.statusCode).toBe(302);
           done();
         });
       });

       it("should update the wiki with the given values", (done) => {
           const options = {
             url: `${base}/wikis/${this.wiki.id}/update`,
             form: {
               title: "Snowman Building Competition",
               body: "I love watching them melt quickly."
             }
           };
           request.post(options,
             (err, res, body) => {

             expect(err).toBeNull();

             Wiki.findOne({
               where: {id: this.wiki.id}
             })
             .then((wiki) => {
               expect(wiki.title).toBe("Snowman Building Competition");
               done();
             });
           });
       });

     });
   });
   // end admin user specs, begin member user specs
  describe("member user performing CRUD actions on another users Wikis", () => {

    // before each test in member user context, send an authentication request
    // to a route we will create to mock an authentication request
     beforeEach((done) => {
      User.create({
        email: "user@example.com",
        password: "123456",
        role: "member"
      })
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
     describe("GET /wikis/new", () => {

       it("should render a new wiki form", (done) => {
         request.get(`${base}/wikis/new`, (err, res, body) => {
           expect(err).toBeNull();
           expect(body).toContain("New Public Wiki");
           done();
         });
       });

     });
     describe("GET /wikis/newPrivate", () => {

       it("should should not render a new private wiki form", (done) => {
         request.get(`${base}/wikis/newPrivate`, (err, res, body) => {
           expect(err).toBeNull();
           expect(body).not.toContain("New Private Wiki");
           done();
         });
       });

     });
     describe("POST /wikis/createPrivate", () => {

        it("should not create a new private wiki", (done) => {
           const options = {
             url: `${base}/wikis/createPrivate`,
             form: {
               title: "Watching snow melt",
               body: "Without a doubt my favoriting things to do besides watching paint dry!",
               private:true,
               userId: this.user.id
             }
           };
           request.post(options,
             (err, res, body) => {

               Wiki.findOne({where: {title: "Watching snow melt"}})
               .then((wiki) => {

                // the code in this block will not be evaluated since the validation error
                // will skip it. Instead, we'll catch the error in the catch block below
                // and set the expectations there

                 done();

               })
               .catch((err) => {
                 expect(err).not.toBeNull();
                 done();
               });
             }
           );
         });
      });
     describe("POST /wikis/create", () => {

        it("should create a new wiki and redirect", (done) => {
           const options = {
             url: `${base}/wikis/create`,
             form: {
               title: "Watching snow melt",
               body: "Without a doubt my favoriting things to do besides watching paint dry!",
               userId: this.user.id
             }
           };
           request.post(options,
             (err, res, body) => {

               Wiki.findOne({where: {title: "Watching snow melt"}})
               .then((wiki) => {
                 expect(wiki).not.toBeNull();
                 expect(wiki.title).toBe("Watching snow melt");
                 expect(wiki.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
                 expect(wiki.topicId).not.toBeNull();
                 done();
               })
               .catch((err) => {
                 console.log(err);
                 done();
               });
             }
           );
         });
         it("should not create a new wiki that fails validations", (done) => {
           const options = {
             url: `${base}/wikis/create`,
             form: {
               title: "a",
               body: "b"
             }
           };

           request.post(options,
             (err, res, body) => {

               Wiki.findOne({where: {title: "a"}})
               .then((wiki) => {
                   expect(wiki).toBeNull();
                   done();
               })
               .catch((err) => {
                 console.log(err);
                 done();
               });
             }
           );
         });
      });
     describe("GET /wikis/:id", () => {

      it("should render a view with the selected wiki", (done) => {
        request.get(`${base}/wikis/${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Cool New Wiki");
          done();
        });
      });

     });
     describe("POST /wikis/:id/destroy", () => {

       it("should not delete a wiki with another user's ID", (done) => {

         expect(this.wiki.id).toBe(1);

         request.post(`${base}/wikis/${this.wiki.id}/destroy`, (err, res, body) => {

           Wiki.findById(1)
           .then((wiki) => {
             expect(wiki).not.toBeNull();
             done();
           })
         });

       });

     });
     describe("GET /wikis/:id/edit", () => {

       it("should render a view with an edit wiki form on another users public wiki", (done) => {
         request.get(`${base}/wikis/${this.wiki.id}/edit`, (err, res, body) => {
           expect(err).toBeNull();
           expect(body).toContain("Cool New Wiki");
           expect(res.statusCode).toBe(200);
           done();
         });
       });

     });
     describe("POST /wikis/:id/update", () => {

        it("should update the public wiki and return 302", (done) => {
          request.post({
            url: `${base}/wikis/${this.wiki.id}/update`,
            form: {
              title: "Snowman Building",
              body: "Not sure why there's even a wiki for this."
            }
          }, (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          });
        });

        it("should  update another users public wiki with the given values", (done) => {
            const options = {
              url: `${base}/wikis/${this.wiki.id}/update`,
              form: {
                title: "Snowman Building",
                body: "Not sure why there's even a wiki for this."
              }
            };
            request.post(options,
              (err, res, body) => {

              expect(res.statusCode).toBe(302);

              Wiki.findOne({
                where: {id: this.wiki.id}
              })
              .then((wiki) => {
                expect(wiki.title).toBe("Snowman Building");
                done();
              });
            });
        });

      });
    });
  describe("member user performing CRUD actions on their own Wikis", () => {

      // before each test in member user context, send an authentication request
      // to a route we will create to mock an authentication request
      beforeEach((done) => {
         request.get({         // mock authentication
            url: "http://localhost:3000/auth/fake",
            form: {
              role: this.user.role,     // mock authenticate as previous user
              userId: this.user.id,
              email: this.user.email
            }
          },
            (err, res, body) => {
              done();
            }
          );
        });
      describe("POST /wikis/:id/destroy", () => {

        it("should delete the wiki with the associated ID", (done) => {

          expect(this.wiki.id).toBe(1);

          request.post(`${base}/wikis/${this.wiki.id}/destroy`, (err, res, body) => {

            Wiki.findById(1)
            .then((wiki) => {
              expect(err).toBeNull();
              expect(wiki).toBeNull();
              console.log(wiki);
              done();
            })
          });

        });

      });
      describe("GET /wikis/:id/edit", () => {

        it("should render a view with an edit wiki form", (done) => {
          request.get(`${base}/wikis/${this.wiki.id}/edit`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Edit Wiki");
            expect(body).toContain("Cool New Wiki");
            done();
          });
        });

      });
      describe("POST /wikis/:id/update", () => {

         it("should return a status code 302", (done) => {
           request.post({
             url: `${base}/wikis/${this.wiki.id}/update`,
             form: {
               title: "Snowman Wrecking Competition",
               body: "I love watching them melt slowly."
             }
           }, (err, res, body) => {
             expect(res.statusCode).toBe(302);
             done();
           });
         });

         it("should update the wiki with the given values", (done) => {
             const options = {
               url: `${base}/wikis/${this.wiki.id}/update`,
               form: {
                 title: "Snowman Wrecking Competition",
                 body: "I love watching them melt quickly."
               }
             };
             request.post(options,
               (err, res, body) => {

               expect(err).toBeNull();

               Wiki.findOne({
                 where: {id: this.wiki.id}
               })
               .then((wiki) => {
                 expect(wiki.title).toBe("Snowman Wrecking Competition");
                 done();
               });
             });
         });

       });
     });
  describe("member user performing CRUD actions on Wikis with Collaboration access", () => {

     // before each test in member user context, send an authentication request
     // to a route we will create to mock an authentication request
     // before each test in admin user context, send an authentication request
     // to a route we will create to mock an authentication request
     beforeEach((done) => {

       User.create({
         id:2,
         email: "wikicollab@example.com",
         password: "asdfasdf",
         role: "member"
       })
       .then((user) => {
         this.user = user;
         Wiki.create({
           id:2,
           title: "Collab Wiki",
           body: "This wiki has one collaborator",
           private:true,
           userId: 1
         })
         .then((res) => {
           this.wiki = res;
           Collaboration.create({
             userId: 2,
             wikiId: 2,
             email:"wikicollab@example.com"
           })
           .then((res) => {
             this.collaboration = res;  // store resulting collab in context
             request.get({         // mock authentication
               url: "http://localhost:3000/auth/fake",
               form: {
                 role: "member",     // mock authenticate as user
                 userId:2,
                 email: "wikicollab@example.com"
               }
             },
               (err, res, body) => {
                 done();
               }
             );
           })
         })
       });
      });
     describe("POST /wikis/:id/destroy", () => {

       it("should not delete the wiki with the associated ID", (done) => {

         expect(this.wiki.id).toBe(2);

         request.post(`${base}/wikis/${this.wiki.id}/destroy`, (err, res, body) => {

           Wiki.findById(2)
           .then((wiki) => {
             expect(wiki.title).toContain('Collab Wiki');
             done();
           })
         });

       });

     });
     describe("POST /wikis/:wikiId/deleteCollab/:id", () => {

       it("should not delete the collab with the associated ID", (done) => {

         expect(this.collaboration.id).toBe(1);

         request.post(`${base}/wikis/${this.wiki.id}/deleteCollab/${this.collaboration.id}`, (err, res, body) => {

           Collaboration.findById(1)
           .then((collab) => {
             expect(collab).not.toBeNull();
             done();
           })
         });

       });

     });
     describe("POST /wikis/:wikiId/addCollab", () => {

       it("should not add a collaborator with the associated ID", (done) => {

         request.post({
           url: `${base}/wikis/${this.wiki.id}/addCollab`,
           form: {
             userId: 1,
             wikiId: this.wiki.id,
             email:"starman@tesla.com"
           }
         }, (err, res, body) => {
           Collaboration.findById(1)
           .then((collab) => {
             expect(collab).not.toBeNull();
             done();
           })
         });

       });

     });
     describe("POST /wikis/:id/update", () => {

        it("should return a status code 302", (done) => {
          request.post({
            url: `${base}/wikis/${this.wiki.id}/update`,
            form: {
              title: "Snowman Wrecking Competition",
              body: "I love watching them melt slowly."
            }
          }, (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          });
        });

        it("should update the wiki with the given values", (done) => {
            const options = {
              url: `${base}/wikis/${this.wiki.id}/update`,
              form: {
                title: "Snowman Wrecking Competition",
                body: "I love watching them melt quickly."
              }
            };
            request.post(options,
              (err, res, body) => {

              expect(err).toBeNull();

              Wiki.findOne({
                where: {id: this.wiki.id}
              })
              .then((wiki) => {
                expect(wiki.title).toBe("Snowman Wrecking Competition");
                done();
              });
            });
        });

      });
    });
});
