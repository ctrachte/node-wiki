const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {

//#1
  describe("GET /", () => {

    it("should return status code 200 and have 'Welcome to Bloccit' in the body of the response", (done) => {
     request.get(base, (err, res, body) => {
       expect(res.statusCode).toBe(200);
       expect(body).toContain("Welcome to Bloccit");
       done();
      });
    });
  });

  //#2
    describe("GET about", () => {

      it("should return status code 200 and have 'About' in the body of the response", (done) => {
       request.get(base, (err, res, body) => {
         expect(res.statusCode).toBe(200);
         expect(body).toContain("About");
         done();
        });
      });
    });

});
