const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {

 new() {
   return this.user != null;
 }

 create() {
   return this.new();
 }

 edit() {
   return this._isAdmin() || this._isOwner() || !this.record.private;
 }

 update() {
   return this.edit();
 }

 destroy() {
   return this.update();
 }
}
