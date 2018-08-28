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
    private: DataTypes.BOOLEAN,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Wiki.associate = function(models) {
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
    Wiki.hasMany(models.Collaboration, {
      foreignKey: "wikiId",
      as: "collaborators",
      onDelete: "CASCADE"
    });
  };
  Wiki.addScope("myWikis", (userId) => {
    return {
      where: { userId: userId},
      order: [["createdAt", "DESC"]]
    }
  });
  return Wiki;
};
