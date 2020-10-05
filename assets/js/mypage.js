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

myPage.prototype.getCoin = function() {
  var url = '/api/coin';
  
}

window.mp = new myPage();