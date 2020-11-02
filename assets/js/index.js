!(function($){
  const appVersion = navigator.appVersion;
  if (appVersion.indexOf("Win") != -1 && (appVersion.indexOf("x64") != -1 || appVersion.indexOf("Win64") != -1 || appVersion.indexOf("WOW64") != -1)) {
    console.log("windows 64");
    document.getElementById("download-windows-64").style.display = "block";
  } else if (appVersion.indexOf("Win") != -1) {
    console.log("windows 32");
    document.getElementById("download-windows-32").style.display = "block";
  }
  
  if (navigator.appVersion.indexOf("Mac") != -1) {
    console.log("Mac");
    document.getElementById("download-mac").style.display = "block";
  }
})(jQuery);
