'use strict';
module.exports = (sequelize, DataTypes) => {
  var Collaboration = sequelize.define('Collaboration', {
    wikiId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {});
  Collaboration.associate = function(models) {
    // associations can be defined here
  };
  return Collaboration;
};
