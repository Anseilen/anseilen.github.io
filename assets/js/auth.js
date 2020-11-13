

function auth() {
  $(function(){
    this.mode = this.getParams("mode")
    this.actionCode = this.getParams("oobCode")
    if(this.mode === "verifyEmail") {
      $("#unintend").css("display", "none")
      $("#email-verification").css("display", "block")
      firebase.auth().applyActionCode(this.actionCode)
      .then(function(response){
        alert("인증되었습니다. 회원가입이 완료되었습니다.");
        window.location.replace("/");
      })
      .catch(function(error){
        alert("만료된 페이지입니다. 메인페이지로 연결됩니다.");
        window.location.replace("/"); 
      })
    } else if(this.mode === "resetPassword") {
      $("#unintend").css("display", "none");
      $("#password-reset").css("display", "block");
      this.$passwordResetErrorMessage = $("#passwordReset-errorMessage")
      var passwordResetSubmit = $("#passwordReset-form__submit");

      passwordResetSubmit.on("click", this.passwordResetSubmit.bind(this));
    }
  }.bind(this))
}

auth.prototype.getParams = function(name){
  var url = window.location.href;
  var filteredname = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + filteredname + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if(!results || !results[2]) throw new Error("Params error.")
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

auth.prototype.passwordResetSubmit = function(event){
  event.preventDefault();
  this.$passwordResetErrorMessage.text('');
  var password1 = $("#inputPassword1").val()
  var password2 = $("#inputPassword2").val()
  if(password1 !== password2) {
    var errorMessage = "비밀번호가 일치하지 않습니다."
    this.$passwordResetErrorMessage.text(errorMessage);
    return;
  }
  console.log(this.actionCode)
  firebase.auth().verifyPasswordResetCode(this.actionCode)
  .then(function() {
    console.log('actioncode',this.actionCode)
    firebase.auth().confirmPasswordReset(this.actionCode, password1)
      .then(function() {
        alert("비밀번호가 재설정 되었습니다.");
        window.location.replace("/");
      })
      .catch(function() {
        alert("비밀번호 재설정에 실패하였습니다. 다시 요청해주세요.");
        window.location.replace("/"); 
      });
  }.bind(this))
  .catch(function(error) {
    console.log(error);
    alert("만료된 페이지입니다. 메인페이지로 연결됩니다.");
    window.location.replace("/"); 
  });
}

window.fAut = new auth();