if(firebase.auth().currentUser) window.location.replace("/");

function signUp() {
  $(function() {
    this.$signupSubmit = $("#signup-form__submit");
    this.$signupErrorMessage = $("#signup-errorMessag");

    this.$signupSubmit.on("click", this.submit.bind(this));
  }.bind(this));
}

signUp.prototype.submit= function(event) {
  event.preventDefault();
  this.$signupErrorMessage.text('');
  const password1 = $("#inputPassword1").val()
  const password2 = $("#inputPassword2").val()
  if(password1 !== password2) {
    const errorMessage = "비밀번호가 일치하지 않습니다."
    this.$signupErrorMessage.text(errorMessage);
    return;
  }
  const requestBody = {}
  const email = $("#inputEmail").val();
  const password = password1;
  requestBody.email = email;
  requestBody.phone = $("#inputPhone").val();
  requestBody.gender = $("#signup-form input[name=genderRadios]:checked").val();
  requestBody.funnel = $("#signup-form input[name=funnelRadios]:checked").val();
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(function(credential) {
    $('#signup-form__submit').attr('disabled',true);
    $('#signup-form__submit__spinner').css('display','inline-block');
    const user = credential.user;
    user.sendEmailVerification()
    firebase.auth().currentUser.getIdToken().then(function(token){
      const request = {
        method: 'POST',
        url: '/api/register',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(requestBody),
        beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)}
      }
      return $.ajax(request).catch(function(error){
        throw new Error('Request create account error:' + error)
      })
    })
    .then(function(){
      console.log("success")
      firebase.auth().signOut().then(function(){
        window.location.replace("/");
      })

      alert("인증메일이 전송되었습니다. 메일을 확인해주세요.")
    })
    .catch(function(){
      console.error("error")
      firebase.auth().signOut().then(function(){
        window.location.replace("/");
      })
      alert("인증메일이 전송되었습니다. 메일을 확인해주세요.")
    })    
  })
  .catch(function(error){
    let errorMessage;
    if(error.code === "auth/weak-password") {
      errorMessage = "비밀번호는 최소 6자리 이상이어야 합니다."
    } else if(error.code === "auth/invalid-email") {
      errorMessage = "이메일 형태를 확인해주세요."
    } else if(error.code === "auth/email-already-in-use") {
      errorMessage = "이미 사용 중인 이메일 입니다."
    } else {
      errorMessage = error.message;
    }
    document.getElementById("signup-errorMessage").innerText=errorMessage;
  })
}

signUp.prototype.createProfile = function(requestBody, token){
  const request = {
    method: 'POST',
    url: '/api/register',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(requestBody),
    beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+token)}
  }
  return $.ajax(request).catch(function(error){
    throw new Error('Request create account error:' + error)
  })
}

window.signup = new signUp();