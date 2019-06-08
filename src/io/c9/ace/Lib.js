/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'io.c9.ace.Lib',
  methods: [
    {
      name: 'ACE',
      code: foam.Function.memoize0(function() {
        return new Promise(function(resolve, reject) {
          var url = (global.FOAM_ROOT && global.FOAM_ROOT + '../node_modules/ace-builds/src-min-noconflict/ace.js' || '/ace.js');
          var script = document.createElement('script');
          script.onload = function () {
            resolve(ace);
          };
          script.onerror = reject;
          script.src = url;
          document.head.appendChild(script);
        });
      })
    }
  ]
});
