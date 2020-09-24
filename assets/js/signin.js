$(document).on("click", "#signin-form__submit", function(event){
  event.preventDefault();
  const email = $("#inputEmail").val();
  const password = $("#inputPassword").val();
  firebaseAuth.signInWithEmailAndPassword(email,password)
  .then(function(){
    window.location.href = "/";
    $("#nav-login__btn").css({display: "none"});
    $("#nav-logout__btn").css({display: "block"});
  })
  .catch(function(error){
    var errorCode = error.code;
    let errorMessage = error.message;
    console.log(errorCode);
    if (errorCode === "auth/network-request-failed") {
      errorMessage = "네트워크가 불안정 합니다. 잠시후 다시 시도해주세요."
    } else if(errorCode === "auth/too-many-requests") {
      errorMessage = "너무 많이 시도 했습니다. 잠시후 다시 시도해주세요."
    } else if(errorCode === "auth/user-disabled") {
      errorMessage = "계정이 사용 정지되었습니다. 고객센터로 문의해주세요."
    } else if(errorCode === "auth/user-not-found") {
      errorMessage = "사용자를 찾을 수 없습니다. 이메일을 확인해주세요."
    } else if(errorCode === "auth/wrong-password") {
      errorMessage = "비밀번호가 잘못되었습니다."
    } else if(errorCode === "auth/invalid-email") {
      errorMessage = "적합하지 않은 이메일입니다."
    };
    $("#signin-errorMessage").text(errorMessage);
  })
})
