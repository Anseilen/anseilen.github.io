if(firebase.auth().currentUser) window.location.replace("/");

$(document).on("click", "#signin-form__submit", function(event){
  event.preventDefault();
  $("#signin-form__submit").attr("disabled", true);
  $("#signin-form__submit__spinner").css("display", "inline-block");
  const email = $("#inputEmail").val();
  const password = $("#inputPassword").val();
  firebase.auth().signInWithEmailAndPassword(email,password)
  .then(function(credential){
    $("#inputEmail").val('');
    $("#inputPassword").val('');
    $("#signin-form__submit").attr("disabled", false);
    $("#signin-form__submit__spinner").css("display", "none");
    if(!credential.user.emailVerified){
      credential.user.sendEmailVerification()
      .then(() => {
        const errorMessage = "<p>인증되지 않은 이메일(아이디)입니다.<br/>입력하신 이메일로 인증메일을 전송하였습니다.</p>"
        $("#signin-errorMessage").html(errorMessage);
      })
      .catch(() => {
        const errorMessage = "<p>인증되지 않은 이메일(아이디)입니다.<br/>잠시후 다시 시도해주시면 인증메일이 전송됩니다.</p>"
        $("#signin-errorMessage").html(errorMessage);
      })
      firebase.auth().signOut();
    }
  })
  .catch(function(error){
    var errorCode = error.code;
    let errorMessage = error.message;
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
    $("#signin-form__submit").attr("disabled", false);
    $("#signin-form__submit__spinner").css("display", "none");
  })

})

$(document).on("click", "#passwordforget-form__submit", function(event){
  event.preventDefault();
  const email = $("#passwordForgetEmail").val();
  firebase.auth().sendPasswordResetEmail(email)
  .then(function(){
    $("#passwordforget-errorMessage").text('');
    $("#passwordforget-form").css({display: "none"})
    $(".modal-body").append('<h6 class="text-success">메일을 전송했습니다. 메일함을 확인해주세요</h6>')
  })
  .catch(function(error){
    var errorCode = error.code;
    let errorMessage = error.message;
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
    $("#passwordforget-errorMessage").text(errorMessage);
  })
})

$(document).on("click", "#google-signin", function(event){
  event.preventDefault()
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
  firebase.auth().languageCode = 'kr';
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(token, user)
    // ...
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log(errorCode, errorMessage, email, credential)
    // ...
  });
})

