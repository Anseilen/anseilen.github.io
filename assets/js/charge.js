$(document).on("click", "#nav-logout__btn", function(event){
  firebaseAuth.signOut();
  window.location.replace("/");
})
console.log($("#nav-logout__btn"))

$("tbody input").each((i,item) => {
  if($(item).is(":checked")) {
    setPrice(item.value);
  }
});
function setPrice(price) {
  if(price) {
    $("#charge-btn").text(`${price.slice(0,-3) + ',' + price.slice(-3)}원 결제하기`);
  } else {
    $("#charge-btn").text(`결제하기`);
  }
}

$(document).on("change", "tbody input:radio", function(event){
  setPrice(event.target.value);
})

$(document).on("click", "#charge-btn", function(event){
  var checkedPrice;
  var checkedMethod;
  $("tbody input").each((i, item) => {
    if($(item).is(":checked")) checkedPrice = item.value;
  })
  $("#charge-method__selection input").each((i, ele) => {
    if($(ele).is(":checked")) checkedMethod = ele.value;
  })
  IMP.request_pay({
    pg : 'kcp', // version 1.1.0부터 지원.
    pay_method : checkedMethod,
    merchant_uid : 'merchant_' + new Date().getTime(),
    name : '풀다 코인충전',
    amount : checkedPrice,
    buyer_email : '',
    m_redirect_url : 'https://www.yourdomain.com/payments/complete'
}, function(rsp) {
    if ( rsp.success ) {
        var msg = '결제가 완료되었습니다.';
        msg += '고유ID : ' + rsp.imp_uid;
        msg += '상점 거래ID : ' + rsp.merchant_uid;
        msg += '결제 금액 : ' + rsp.paid_amount;
        msg += '카드 승인번호 : ' + rsp.apply_num;
    } else {
        var msg = '결제에 실패하였습니다.';
        msg += '에러내용 : ' + rsp.error_msg;
    }
    alert(msg);
});
})


