domino.views.define('index', function(view) {
  
  this.indexView = function(view_script) {
    view_script.no_render = true;
    view_script.$container = '#index-container';
    document.title = 'Nightwatch.js | Node.js powered End-to-End testing framework';
    this.initHelper('transition').render();
  };
  
});
   
domino.views.define('guide', function(view) {
  
  this.init = function() {};
    
  this.indexView = function(view_script) {
    view_script.$container = '#guide-container';
    view_script.no_render = true;
    document.title = 'Nightwatch.js - Developer Guide';
    
    this.initHelper('transition').render();
    this.initHelper('bs.scrollspy').render({
      target : '#guide-container .bs-sidebar',
      offset : 50
    });
    
    this.initHelper('sidebar').render('#guide-container');
    //this.initHelper('sourcecolor').render(document.getElementById("guide-container"));        
      
  };
  
});

domino.views.define('api', function(view) {
  this.init = function() {
    
  };
  
  function api(view_script, scollspy) {
    view_script.$container = '#api-container';

    this.initHelper('transition').render(function() {
      if (scollspy) {
        this.initHelper('bs.scrollspy').render({
          target : '#api-container .bs-sidebar',
          offset : 580,
          spyAttribute : 'data-spy'
        });  
        
        this.initHelper('sourcecolor').render();
        this.initHelper('sidebar').render('#api-container');
      }
      
      
    }, view_script);
  }
  
  this.methodView = function(view_script) {
    window.scrollTo(0, 0);
    document.title = 'Nightwatch.js - API Reference';
    api.call(this, view_script, false);
  };
  
  this.indexView = function(view_script) {
    document.title = 'Nightwatch.js - API Reference';
    view_script.no_render = true;

    this.initHelper('transition').render();
    this.initHelper('bs.scrollspy').render({
      target : '#api-container .bs-sidebar',
      offset : 50
    });

    this.initHelper('sidebar').render('#api-container');
  };
  
});

domino.views.define('contact', function(view) {
  
  this.indexView = function(view_script) {
    view_script.$container = '#contact-container';
    view_script.no_render = true;
    document.title = 'Nightwatch.js - Contact';
    this.initHelper('transition').render();
  };
  
});

domino.viewhelpers.define('sidebar', function() {
  
  this.init = function() {
    this.sideBar = null;
  };
  
  this.render = function(container) {
    if (this.sideBar) {
      this.sideBar.data('bs.affix', null);
    }  
    
    var $sideBar = this.sideBar = $(container).find('.bs-sidebar');
    $sideBar.affix({
      offset: {
        top: 180,
        bottom: 100
      }
    });
  };
  
});

domino.viewhelpers.define('bs.scrollspy', function() {
  this.init = function(element) {
    element = element || $(document.body);
    if (!(element instanceof jQuery)) {
      element = $(element);
    }
    this.spyElem = element;    
  };
  
  this.render = function(opts) {
    if (this.spyElem.data('bs.scrollspy')) {
      $(opts.target).off('click');
      this.spyElem.data('bs.scrollspy', null);
    }
    
    
    $(opts.target).on('click', 'a', function(ev) {
      ev.stopPropagation();
    });
    
    this.spyElem.scrollspy(opts);
  };  
});

      
domino.viewhelpers.define('sourcecolor', function() {
  this.render = function(element) {
    setTimeout(function() {
      Prism.highlightAll();
    }, 0);    
  };
});

domino.viewhelpers.define('transition', function() {
  
  this.render = function(callback, opts) {
    var pathname = location.pathname;
    if (pathname != "/") {
      pathname = '/' + pathname.split('/')[1];     
    }
    
    var currentMenuItem = $('.navbar ul li.active');
    var activeMenuItem = $('.navbar ul li a[href="'+ pathname +'"]').parent();
    if (currentMenuItem !== activeMenuItem) {
      currentMenuItem.removeClass('active');
      activeMenuItem.addClass('active');
    } 
      
    var $view = this.view;      
      
    var currentSection = $('section[data-page-uri]:visible');
    var element = $('section[data-page-uri="'+ pathname +'"]');
    if (currentSection.get(0) === element.get(0)) {
      if (typeof callback == 'function') {
        opts.render = function() {
          callback.call($view);
        };  
      }
      return;
    }
    
    currentSection.hide();
    element.fadeIn('normal', function() {
      if (typeof callback == 'function') {
        return callback.call($view);
      }
    });
  };
});
