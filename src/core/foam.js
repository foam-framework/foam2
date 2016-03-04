(function() {

  var isServer = typeof process === 'object';

  function createLoadBrowser() {
    var path = document.currentScript && document.currentScript.src;

    // document.currentScript isn't supported on all browsers, so the following
    // hack gets the job done on those browsers.
    if ( ! path ) {
      var scripts = document.getElementsByTagName('script');
      for ( var i = 0 ; i < scripts.length ; i++ ) {
        if ( scripts[i].src.match(/\/bootFOAM.js$/) ) {
          path = scripts[i].src;
          break;
        }
      }
    }

    path = path.substring(0, path.lastIndexOf('/')+1);

    return function(filename) {
      document.writeln(
        '<script type="text/javascript" src="' + path + filename + '.js"></script>\n');
    }
  }

  function loadServer(filename) {
    require('./' + filename + '.js');
  }

  [
    "stdlib",
    "Boot",
    "Dynamic",
    "Window",
    "JSON",
    "objects",
    "patterns",
    "debug",
    "types",
    "parse",
    "templates",
    "Action",
    [ "../lib/graphics", ! isServer ]
  ].
      filter(function (f) { return ! Array.isArray(f) || f[1]; }).
      map(function(f) { return Array.isArray(f) ? f[0] : f; }).
      forEach(isServer ? loadServer : createLoadBrowser());

})();
