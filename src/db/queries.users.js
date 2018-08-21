const User = require("./models").User;
const bcrypt = require("bcryptjs");
const Post = require("./models").Post;
const stripe = require("stripe")("sk_test_U68vkbnSn99gjqwhOQHA7TBx");
const Authorizer = require("../policies/application");
const Wiki = require("./models").Wiki;


module.exports = {
  createUser(newUser, callback){

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      email: newUser.email,
      password: hashedPassword,
      role: newUser.membershipType
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  upgradeAccount(req, callback){
    return User.findById(req.params.id)
    .then((user) => {
      if(!user){
        return callback("No user account found for that email.");
      }
      const token = req.body.stripeToken; // Using Express

      const charge = stripe.charges.create({
        amount: 1500,
        currency: 'usd',
        description: 'Node Wiki Premium Account',
        source: token,
      });
      user.update({
        role: "premium"
      })
      .then(() => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
    });
  },
  downgradeAccount(id, callback){

    return User.findById(id)
    .then((user) => {
      if(!user){
        return callback("No user account found for that user id...");
      } else {
        user.update({
          role: "member"
        })
        .then(() => {
          callback(null, user);
        })
        .catch((err) => {
          callback(err);
        });
      }
    });
  },

  getUser(id, callback){
    let result = {};
    User.findById(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result["user"] = user;
        Wiki.scope({method: ["lastFiveFor", id]}).all()
        .then((wikis) => {
          result["wikis"] = wikis;
          callback(null, result);
        })
        .catch((err) => {
          callback(err);
        })
      }
    })
  }

}
