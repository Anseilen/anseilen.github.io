function myPage() {
  $(function() {
    if(sessionStorage.getItem('eml')) {
      $("#account-info__email").text(sessionStorage.getItem('eml'));
    }
    if(sessionStorage.getItem('cct') && new Date().getTime() - sessionStorage.getItem('cct') < sessionStorage.getItem('cctd')){
      if(sessionStorage.getItem('cn')) {
        $('#account-info__coin').text(sessionStorage.getItem('cn'));
      }
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          if(!sessionStorage.getItem('cn')) {
            user.getIdToken().then(function(token){
              const request = {
                method: 'GET',
                url: '/api/coin',
                dataType: 'json',
                beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
              }
              $.ajax(request)
                .done(function(json) {
                  $('#account-info__coin').text(json.coin);
                  sessionStorage.setItem('cn', json.coin);
                })
            })
          }
        }
    });
    this.$logoutButton = $("#nav-logout__btn");
    this.$logoutButton.on("click", this.logOut.bind(this));
  }.bind(this));
}

myPage.prototype.logOut = function() {
  firebase.auth().signOut();
  sessionStorage.clear();
}

myPage.prototype.getCoin = function() {
  firebase.auth().currentUser.getIdToken()
  .then(function(token){
    const request = {
      method: 'GET',
      url: '/api/coin',
      dataType: 'json',
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
    }
    return $.ajax(request)
      .done(function(json) {
        $('#account-info__coin').text(json.coin)
      })
  })
}

window.mp = new myPage();