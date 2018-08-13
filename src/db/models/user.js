'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: {
          args: true,
          msg: 'Looks like an account with this email address already exists, try another.',
          fields: [sequelize.fn('lower', sequelize.col('email'))]
      },
      validate: {
          isEmail: {
              args: true,
              msg: 'The email you entered is invalid.'
          },
          max: {
              args: 254,
              msg: 'The email you entered is longer than 254 characters.'
          }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "member"
    }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });
  };
  User.prototype.isAdmin = function() {
    return this.role === "admin";
  };
  User.prototype.exists = function() {
    return User.findOne;
  };
  return User;
};
