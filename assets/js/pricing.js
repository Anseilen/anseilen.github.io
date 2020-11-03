!(function($){
  if(sessionStorage.getItem('cct') && new Date().getTime() - sessionStorage.getItem('cct') < sessionStorage.getItem('cctd')){
    if(sessionStorage.getItem('eml')) {
      $('#price-account__btn').attr('href', '/charge')
      $('#price-account__btn').text('충전하러 가기')
    }
  }
})(jQuery);