function myPage() {
  $(function() {
    this.$logoutButton = $("#nav-logout__btn");

    this.$logoutButton.on("click", this.logOut.bind(this));
  }.bind(this));
}

myPage.prototype.logOut = function() {
  firebase.auth().signOut();
  window.location.replace("/");
}

window.mp = new myPage();