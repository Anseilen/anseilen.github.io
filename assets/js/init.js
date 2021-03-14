!(function($){
  if(sessionStorage.getItem('cct') && new Date().getTime() - sessionStorage.getItem('cct') < sessionStorage.getItem('cctd')) {
    $('.nav-account__btn a').remove();
    if(sessionStorage.getItem('eml')) {
      $('.nav-account__btn').append('<a class="get-started" href="/charge">마이페이지</a>');
      if(window.location.pathname.match("signin")) window.location.replace("/");
    } else {
      $('.nav-account__btn').append('<a class="get-started" href="/signin">로그인</a>')
      // No user is signed in.
      if(window.location.pathname.match("charge")) window.location.replace("/signin");
      else if(window.location.pathname.match("chaList")) window.location.replace("/signin");
      else if(window.location.pathname.match("useList")) window.location.replace("/signin");
    }
  }
  firebase.auth().onAuthStateChanged(function(user) {
    if(!sessionStorage.getItem('cct') || new Date().getTime() - sessionStorage.getItem('cct') > sessionStorage.getItem('cctd') || window.location.pathname.match("signin")) {
      $('.nav-account__btn a').remove();
      if (user) {
        // User is signed in.
        if(user.emailVerified){
          $('.nav-account__btn').append('<a class="get-started" href="/charge">마이페이지</a>')
          sessionStorage.setItem('eml', user.email);
          sessionStorage.removeItem('cn');
          if(window.location.pathname.match("signin")) window.location.replace("/");
          if(window.location.pathname.match("pricing")) {
            $('#price-account__btn').attr('href', '/charge')
            $('#price-account__btn').text('충전하러 가기')
          }
        } else {
          if(window.location.pathname.match("signin")) return;
          else if(window.location.pathname.match("signup")) return;
          else {
            alert("인증되지 않은 이메일(아이디)입니다. 인증메일을 확인하세요.");
            firebase.auth().signOut().then(function(){
              sessionStorage.clear();
              window.applicationCache.replace("/");
            });
          }
        }
      } else {
        $('.nav-account__btn').append('<a class="get-started" href="/signin">로그인</a>')
        // No user is signed in.
        if(window.location.pathname.match("charge")) window.location.replace("/signin");
        else if(window.location.pathname.match("chaList")) window.location.replace("/signin");
        else if(window.location.pathname.match("useList")) window.location.replace("/signin");
        sessionStorage.removeItem('eml');
      }
      sessionStorage.setItem('cct', new Date().getTime());
      sessionStorage.setItem('cctd', 60000);
    }
  });

  var IMP = window.IMP; // 생략가능
  IMP.init('imp26139789'); // 'iamport' 대신 부여받은 "가맹점 식별코드"를 사용
  
})(jQuery, firebase);