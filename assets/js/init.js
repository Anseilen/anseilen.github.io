!(function($){
  firebase.auth().onAuthStateChanged(function(user) {
    $('#nav-account__btn a').remove()
    if (user) {
      // User is signed in.
      $('#nav-account__btn').append('<a class="get-started" href="/charge">마이페이지</a>')
      if(window.location.pathname.match("signin")) window.location.replace("/");
    } else {
      $('#nav-account__btn').append('<a class="get-started" href="/signin">로그인</a>')
      // No user is signed in.
      if (window.location.pathname.match("/\/$/")) return;
      else if(window.location.pathname.match("charge")) window.location.replace("/signin");
      else if(window.location.pathname.match("chaList")) window.location.replace("/signin");
      else if(window.location.pathname.match("useList")) window.location.replace("/signin");
    }
  });

  var IMP = window.IMP; // 생략가능
  IMP.init('imp26139789'); // 'iamport' 대신 부여받은 "가맹점 식별코드"를 사용
  
})(jQuery, firebase);