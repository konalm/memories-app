(function(global) {
  var app = new domino.App({
    throw_exceptions : true,
    views_path : '/js/app/',
    routes : [
      {
        "route" : "/api/:method_name.html",
        "defaults" : {
          "controller" : "api",
          "action"     : "method"  
        }
      }
    ]
  });
    
  $(function() {
    app.init();
  });
})(window);  
