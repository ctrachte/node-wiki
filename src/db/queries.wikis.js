const Wiki = require("./models").Wiki;
const Collaboration = require("./models").Collaboration;
const Authorizer = require("../policies/wiki");
const User = require("./models").User;
const Op = require("sequelize").Op;

module.exports = {
  getAllWikis(callback){
    return Wiki.all()
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getPublicWikis(id, callback){
    return Wiki.findAll({
      include: [{model:Collaboration, as: 'collaborators', attributes:['userId']}],
      where:{[Op.or]:[{private:false}, {"$collaborators.userId$": id}]}
    })
    .then((wikis) => {
      callback(null, wikis);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    })
  },
  makePublic(id, callback){
    return Wiki.findAll({where:{private:true, userId:id}})
    .then((wikis) => {
      for (let wiki of wikis) {
        wiki.update({private:false});
      }
      callback(null, wikis);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    })
  },
  changePrivacy(id, callback){
    return Wiki.findOne({where:{id:id}})
    .then((wiki) => {
      if (wiki.private) {
        wiki.update({private:false})
      } else {
        wiki.update({private:true})
      }
      callback(null, wiki);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    })
  },
  addWiki(newWiki, callback){
    return Wiki.create(newWiki)
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },
  getWiki(id, userId, callback){
    return Wiki.findById(id, {
      include: [{model:Collaboration, as: 'collaborators', attributes:['id','userId', 'wikiId', 'email']}]
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    })
  },
  getEditWiki(id, userId, callback){
    return Wiki.findById(id, {
      include: [{model:Collaboration, as: 'collaborators', attributes:['id','userId', 'wikiId', 'email']}],
      where:{"$collaborators.wikiId$":id}
    })
    .then((wiki) => {
      callback(null, wiki);
    })
    .catch((err) => {
      callback(err);
    })
  },
  deleteWiki(req, callback){

    return Wiki.findById(req.params.id)
    .then((wiki) => {
      const authorized = new Authorizer(req.user, wiki, null).destroy();

      if(authorized) {
        wiki.destroy()
        .then((res) => {
          callback(null, wiki);
        });

      } else {

        req.flash("notice", "You are not authorized to delete this wiki.")
        callback(401);
      }
    })
    .catch((err) => {
      callback(err);
    });
  },
  updateWiki(req, updatedWiki, callback){

    return Wiki.findById(req.params.id)
    .then((wiki) => {
      if(!wiki){
        return callback("Wiki not found");
      }

      const authorized = new Authorizer(req.user, wiki).update();

      if(authorized) {

        wiki.update(updatedWiki, {
          fields: Object.keys(updatedWiki)
        })
        .then(() => {
          callback(null, wiki);
        })
        .catch((err) => {
          callback(err);
        });
      } else {

        req.flash("notice", "You are not authorized to update this wiki.");
        callback("Forbidden");
      }
    });
  }
}
