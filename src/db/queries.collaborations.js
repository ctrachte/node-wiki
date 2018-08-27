const Collaboration = require("./models").Collaboration;
const Authorizer = require("../policies/wiki");
const User = require("./models").User;

module.exports = {
  getAllCollaborations(callback){
    return Collaboration.all()
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
      const authorized = new Authorizer(req.user, collab).destroy();

      if(authorized) {
        collab.destroy()
        .then((res) => {
          callback(null, collab);
        });

      } else {

        req.flash("notice", "You are not authorized to remove Collaborators.")
        callback(401);
      }
    })
    .catch((err) => {
      callback(err);
    });
  }
  // updateCollaboration(req, updatedCollaboration, callback){
  //
  //   return Collaboration.findById(req.params.id)
  //   .then((wiki) => {
  //     if(!wiki){
  //       return callback("Collaboration not found");
  //     }
  //
  //     const authorized = new Authorizer(req.user, wiki).update();
  //
  //     if(authorized) {
  //
  //       wiki.update(updatedCollaboration, {
  //         fields: Object.keys(updatedCollaboration)
  //       })
  //       .then(() => {
  //         callback(null, collaboration);
  //       })
  //       .catch((err) => {
  //         callback(err);
  //       });
  //     } else {
  //
  //       req.flash("notice", "You are not authorized to update this collaboration.");
  //       callback("Forbidden");
  //     }
  //   });
  // }
}
