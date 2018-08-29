const ApplicationPolicy = require("./application");

module.exports = class CollaborationPolicy extends ApplicationPolicy {

 new() {
   return this._isAdmin() || this._isOwner();
 }

 edit() {
   return this.new();
 }

 update() {
   return this.edit();
 }

 destroy() {
   return this.update();
 }
}
