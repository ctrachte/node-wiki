'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wiki = sequelize.define('Wiki', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING,
      allowNull: false
    },
    private: DataTypes.BOOLEAN
  }, {});
  Wiki.associate = function(models) {
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
  };
  return Wiki;
};
