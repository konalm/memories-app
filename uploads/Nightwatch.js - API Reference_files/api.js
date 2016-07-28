domino.controllers.define('api', function($api, $protocol) {
  
  this.indexAction = function() {
    //this.$view.methods = $api.getAll();
    //this.$view.api = $protocol.getAll();
  };
  
  this.methodAction = function() {
    this.$view.methods = $api.getAll();
    this.$view.api = $protocol.getAll().result(function(data) {
      for (var section in data) {
        var items = data[section];
        for (var i = 0; i < items.length; i++) {
          if (items[i].name.toLowerCase() == this.params.method_name.toLowerCase()) {
            this.$view.method = items[i];
            this.$view.section = section;
            break;
          }
        }  
      }
      
    });
    this.$view.methodName = this.params.method_name;
  };
});

domino.models.provide('api', function() {
  this.url = '/js/app/api/methods.json';
  this.getAll = this.$get(function(model) {
    this.dataType = 'json';
    this._id = 'methods-list';
    this.cacheresult = true;
  });
  
});

domino.models.provide('protocol', function() {
  this.url = '/js/app/api/output.json';
  this.getAll = this.$get(function(model) {
    this.dataType = 'json';
    this._id = 'protocol-list';
    this.cacheresult = true;
  });
});

domino.controllers.define('blog', function($api, $protocol) {
  this.init = function() {
    window.location.href = '/blog';
  };

  this.indexAction = function() {

  };
});
