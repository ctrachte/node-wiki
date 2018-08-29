const Collaboration = require("./models").Collaboration;
const Authorizer = require("../policies/wiki");
const User = require("./models").User;
const Wiki = require("./models").Wiki;

module.exports = {
  getAllCollaborations(id, callback){
    return Collaboration.findAll({
      where:{wikiId: id}
    })
    .then((collaborations) => {
      callback(null, collaborations);
    })
    .catch((err) => {
      callback(err);
    })
  },
  addCollaboration(newCollaboration, callback){
    Collaboration.findOne({where:{userId:newCollaboration.userId, wikiId:newCollaboration.wikiId}})
    .then((collaboration) => {
      if (!collaboration) {
        return Collaboration.create(newCollaboration)
        .then((collaboration) => {
          callback(null, collaboration);
        })
        .catch((err) => {
          callback(err);
        })
      } else {
        callback("This user is already a collaborator!");
      }
    })
    .catch((err) => {
      callback(err);
    })
  },
  deleteCollaboration(req, callback){

    return Collaboration.findById(req.params.id)
    .then((collab) => {
      Wiki.findById(req.params.wikiId)
      .then((wiki) => {

        const authorized = new Authorizer(req.user, wiki).destroy();

        if(authorized) {
          collab.destroy()
          .then((res) => {
            callback(null, collab);
          });
        } else {
          req.flash("notice", "You are not authorized to remove Collaborators.")
          callback(401);
        }

      }).catch((err) => {
        callback(err);
      });

    })
    .catch((err) => {
      callback(err);
    });
  }
}
