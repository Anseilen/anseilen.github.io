function useList() {
  $(function() {
    if(sessionStorage.getItem('cct') && new Date().getTime() - sessionStorage.getItem('cct') < sessionStorage.getItem('cctd')) {
      if(sessionStorage.getItem('uitems')) {
        var items = JSON.parse(sessionStorage.getItem('uitems'));
        items.forEach(function(item) {
          var date = item.requestDate.substr(0,10);
          $('#useTable tbody').append('<tr><td>'+date+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>');
        })
      }
    }else{
      sessionStorage.removeItem('uitems');
    }
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        if(!sessionStorage.getItem('ctimes')) {
          $('#useTable tbody tr').remove();
          $('#useTable tbody').append('<tr><td><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td></tr>');
          firebase.auth().currentUser.getIdToken()
          .then(function(token){
            var request = {
              method: 'GET',
              url: '/api/usages',
              dataType: 'json',
              beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+token)},
            }

            return $.ajax(request)
              .done(function(json) {
                $('#useTable tbody tr').remove();
                json.items.forEach(function(item) {
                  var date = item.requestDate.substr(0,10);
                  $('#useTable tbody').append('<tr><td>'+date+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>')
                })
                sessionStorage.setItem('uitems', JSON.stringify(json.items))
              })
          })
        }
      }
    })
    this.$getListButton = $("#useBtn");
    this.$appendListButton = $("#useMoreBtn");
    this.$appendListButton.on("click", this.appendList.bind(this));
    this.$getListButton.on("click", this.getInitList.bind(this));
  }.bind(this))
}

useList.prototype.getInitList = function() {
  $('#useTable tbody tr').remove();
  $('#useTable tbody').append('<tr><td><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td></tr>')
  firebase.auth().currentUser.getIdToken()
  .then(function(token){
    var request = {
      method: 'GET',
      url: '/api/usages',
      dataType: 'json',
      beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+ token)},
    }

    return $.ajax(request)
        .done(function(json) {
          $('#useTable tbody tr').remove();
          json.items.forEach(function(item) {
            var date = item.requestDate.substr(0,10);
            $('#useTable tbody').append('<tr><td>'+date+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>')
          })
          sessionStorage.setItem('uitems', JSON.stringify(json.items));
        })
  })
}

useList.prototype.appendList = function(){
  var uitems = JSON.parse(sessionStorage.getItem('uitems'));
  var lastVisible = uitems[uitems.length -1].id;
  firebase.auth().currentUser.getIdToken()
    .then(function(token){
      var request = {
        method: 'GET',
        url: '/api/usages?last='+lastVisible,
        dataType: 'json',
        beforeSend: function(xhr){ xhr.setRequestHeader('Authorization', 'Bearer '+token)},
      }
      return $.ajax(request)
        .done(function(json) {
          if(!json.items.length) {
            alert("더 이상 조회가능한 내역이 없습니다.");
          } else {
            json.items.forEach(function(item) {
              var date = item.requestDate.substr(0,10);
              $('#useTable tbody').append('<tr><td>'+date+'</td><td>'+item.name+'</td><td>'+item.status+'</td></tr>');
            })
            var oldItems = JSON.parse(sessionStorage.getItem('uitems'));
            var newItems = oldItems.concat(json.items)
            sessionStorage.setItem('uitems', JSON.stringify(newItems));
          }
        });
    });

}

window.sy_ul = new useList();