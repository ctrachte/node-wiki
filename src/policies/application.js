module.exports = class ApplicationPolicy {

  constructor(user, record, collabs) {
    this.user = user;
    this.record = record;
    this.collabs = collabs;
  }

  _isCollab() {
    if (this.collabs) {
      for (let collab of this.collabs) {
        if (collab.userId == this.user.id && collab.wikiId == this.record.id) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  }

  _isOwner() {
    return this.record && (this.record.userId == this.user.id);
  }

  _isAdmin() {
    return this.user && this.user.role == "admin";
  }

  _isPremium() {
    return this.user && this.user.role == "premium" || this._isAdmin();
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  showUpgrade() {
    return this.user && this.user.role != "premium";
  }

  downgradeAccount () {
    return this.user && this._isPremium();
  }

  upgradeAccount() {
    return this.showUpgrade();
  }

  edit() {
    return this.new() &&
      this.record && (this._isOwner() || this._isAdmin());
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
}
