function chaList() {
  $(function() {
    if(sessionStorage.getItem('cct') && new Date().getTime() - sessionStorage.getItem('cct') < sessionStorage.getItem('cctd')) {
      if(sessionStorage.getItem('citems')) {
        const items = JSON.parse(sessionStorage.getItem('citems'));
        items.forEach(function(item) {
          const date = item.date.substr(0,10);
          const amount = String(item.amount).slice(0,-3) + ',' + String(item.amount).slice(-3);
          const cancelledCoin = item.cancelled ? `${item.cancelled}  ©` : "    "
          $('#chaTable tbody').append(`<tr><td>${date}</td><td>${item.coin}  ©</td><td>${amount} 원</td><td>${cancelledCoin}</td></tr>`);
        })
      }
    }else{
      sessionStorage.removeItem('citems');
    }
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        if(!sessionStorage.getItem('citems')) {
          $('#chaTable tbody tr').remove();
          $('#chaTable tbody').append(`<tr><td><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td></tr>`);
          firebase.auth().currentUser.getIdToken()
          .then(function(token){
            const request = {
              method: 'GET',
              url: '/api/charges',
              dataType: 'json',
              beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
            }
        
            return $.ajax(request)
                .done(function(json) {
                  $('#chaTable tbody tr').remove();
                  json.items.forEach(function(item) {
                    const date = item.date.substr(0,10);
                    const amount = String(item.amount).slice(0,-3) + ',' + String(item.amount).slice(-3);
                    const cancelledCoin = item.cancelled ? `${item.cancelled}  ©` : "    "
                    $('#chaTable tbody').append(`<tr><td>${date}</td><td>${item.coin}  ©</td><td>${amount} 원</td><td>${cancelledCoin}</td></tr>`);
                  })
                  sessionStorage.setItem('citems', JSON.stringify(json.items));
                })
          })
        }
      }
    })
    this.$getListButton = $("#chaBtn");
    this.$appendListButton = $("#chaMoreBtn");
    this.$appendListButton.on("click", this.appendList.bind(this))
    this.$getListButton.on("click", this.getInitList.bind(this))
  }.bind(this))
}

chaList.prototype.getInitList = function() {
  $('#chaTable tbody tr').remove();
  $('#chaTable tbody').append(`<tr><td><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td></tr>`) 
  firebase.auth().currentUser.getIdToken()
  .then(function(token){
    const request = {
      method: 'GET',
      url: '/api/charges',
      dataType: 'json',
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
    }

    return $.ajax(request)
        .done(function(json) {
          $('#chaTable tbody tr').remove();
          json.items.forEach(function(item) {
            const date = item.date.substr(0,10);
            const amount = String(item.amount).slice(0,-3) + ',' + String(item.amount).slice(-3);
            const cancelledCoin = item.cancelled ? `${item.cancelled}  ©` : "    "
            $('#chaTable tbody').append(`<tr><td>${date}</td><td>${item.coin}  ©</td><td>${amount} 원</td><td>${cancelledCoin}</td></tr>`);
          })
          sessionStorage.setItem('citems', JSON.stringify(json.items));
        })
  })
}

chaList.prototype.appendList = function(){
  const citems = JSON.parse(sessionStorage.getItem('citems'))
  const lastVisible = citems[citems.length -1].id
  firebase.auth().currentUser.getIdToken()
  .then(function(token){
    const request = {
      method: 'GET',
      url: `/api/charges?last=${lastVisible}`,
      dataType: 'json',
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
    }
  
    return $.ajax(request)
      .done(function(json) {
        if(!json.items.length) {
          alert("더 이상 조회가능한 내역이 없습니다.");
        } else {
          json.items.forEach(function(item) {
            const date = item.date.substr(0,10);
            const amount = String(item.amount).slice(0,-3) + ',' + String(item.amount).slice(-3);
            const cancelledCoin = item.cancelled ? `${item.cancelled}  ©` : "    "
            $('#chaTable tbody tr:last-child').after(`<tr><td>${date}</td><td>${item.coin}  ©</td><td>${amount} 원</td><td>${cancelledCoin}</td></tr>`); 
          })
          const oldItems = JSON.parse(sessionStorage.getItem('citems'));
          const newItems = oldItems.concat(json.items)
          sessionStorage.setItem('citems', JSON.stringify(newItems));
        }
      })
  })
}
window.sy_cl = new chaList();