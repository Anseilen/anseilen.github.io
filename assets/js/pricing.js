!(function($){

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      $('#price-account__btn').attr('href', '/charge')
      $('#price-account__btn').text('충전하러 가기')
    } else {
      // No user is signed in.
    }
  });
  
})(jQuery);