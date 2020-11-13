function chargeSection() {
  $(function() {
    this.$priceInput = $("tbody input");
    this.$priceInputRadio = $("tbody input:radio");
    this.$chargeButton = $("#charge-btn");

    this.$priceInput.each(function(i, item) {
      if($(item).is(':checked')) {
        this.setPrice(item.value);
      }
    }.bind(this));
    this.$priceInputRadio.on('change', function(event) {
      this.setPrice(event.target.value);
    }.bind(this));
    this.$chargeButton.on('click', this.charge.bind(this));
  }.bind(this));
}

chargeSection.prototype.setPrice = function(price) {
  if(price) {
    $("#charge-btn").text(''+price.slice(0,-3)+ ' ,' + price.slice(-3)+'원 결제하기');
  } else {
    $("#charge-btn").text('결제하기');
  } 
}

chargeSection.prototype.charge = function(event) {
  var checkedPrice;
  var checkedMethod;
  var merchant_uid = 'ans_' + new Date().getTime(); 
  var buyerEmail = sessionStorage.getItem('eml')
  $("tbody input").each(function(i, item){
    if($(item).is(":checked")) checkedPrice = +item.value;
  })
  $("#charge-method__selection input").each(function(i, ele) {
    if($(ele).is(":checked")) checkedMethod = ele.value;
  })
  // checkedPrice = 100
  firebase.auth().currentUser.getIdToken()
  .then(function(token){
    var request = {
      method: 'POST',
      url: '/payments/request',
      dataType: 'text',
      contentType: 'application/json',
      data: JSON.stringify({
        merchant_uid: merchant_uid,
        amount: checkedPrice
      }),
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)}
    }
    return $.ajax(request)
    .done(function(){
      IMP.request_pay({
        pg : 'html_inicis',
        pay_method : checkedMethod,
        merchant_uid : merchant_uid,
        name : '풀다 코인충전 '+checkedPrice,
        amount : checkedPrice,
        buyer_name: buyerEmail,
        buyer_email : buyerEmail,
      }, function(rsp) {
          if ( rsp.success ) {
              var msg = '결제가 완료되었습니다.';
              msg += '고유ID : ' + rsp.imp_uid;
              msg += '상점 거래ID : ' + rsp.merchant_uid;
              msg += '결제 금액 : ' + rsp.paid_amount;
              msg += '카드 승인번호 : ' + rsp.apply_num;
              firebase.auth().currentUser.getIdToken()
              .then(function(token){
                $.ajax({
                  method: "POST",
                  url: "/payments/complete",
                  contentType: "application/json",
                  data: JSON.stringify({
                    imp_uid: rsp.imp_uid,
                    merchant_uid: rsp.merchant_uid,
                  }),
                  beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+token)}
                })
                .done(function(data){
                  sessionStorage.clear()
                  window.location.replace("/charge")
                })
              })
          } else {
              var msg = '결제에 실패하였습니다.';
              msg += '에러내용 : ' + rsp.error_msg;
          }
          alert(msg);
      });
    })
    .fail(function(qXHR, textStatus){
      console.error(qXHR.status, textStatus)
      alert('충전에 실패했습니다. 다시 시도해주세요.')
    })
  }) 
}

window.ch = new chargeSection();
