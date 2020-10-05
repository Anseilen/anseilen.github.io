!(function($){

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      $("#nav-login__btn").css({display: "none"});
      $("#nav-mypage__btn").css({display: "block"});
      if(window.location.pathname.match("signin")) window.location.replace("/");
    } else {
      // No user is signed in.
      $("#nav-login__btn").css({display: "block"});
      $("#nav-mypage__btn").css({display: "none"});
      if(window.location.pathname.match("mypage")) window.location.replace("/signin");
    }
  });

  var IMP = window.IMP; // 생략가능
  IMP.init('imp26139789'); // 'iamport' 대신 부여받은 "가맹점 식별코드"를 사용
  
})(jQuery, firebase);