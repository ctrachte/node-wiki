const User = require("./models").User;
const bcrypt = require("bcryptjs");
const Post = require("./models").Post;


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
  }

}
