foam.CLASS({
  package: 'io.c9.ace',
  name: 'Lib',
  constants: [
    {
      name: 'ACE',
      factory: function() {
        return new Promise(function(resolve) {
          var url = global.FOAM_ROOT + '../node_modules/ace-builds/src-min-noconflict/ace.js';
          var script = document.createElement('script');
          script.onload = function () {
            resolve(ace);
          };
          script.src = url;
          document.head.appendChild(script);
        });
      }
    }
  ]
});