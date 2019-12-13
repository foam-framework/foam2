/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foamlink',
  name: 'FoamlinkNodeModelFileFetcher',
  properties: [
    'root',
    'foamlinkData_'
  ],
  methods: [
    function init() {
      // TODO: error handling in this method
      var dataFile = foam.foamlink.dataFile;
      var dataText = require('fs').readFileSync(dataFile, 'utf8');
      this.foamlinkData_ = JSON.parse(dataText);
    },
    function getFile(id) {
      var self = this;
      return new Promise(function(ret, err) {
        var path = self.foamlinkData_.classesToFiles[id];
        if ( path === undefined ) {
          ret(null);
          return;
        }
        try {
          var js = require('fs').readFileSync(path, 'utf8');
          // TODO: anything but this terrible array thing
          ret(['withsource', {
            text: js,
            source: path
          }]);
        } catch(e) {
          console.error(e);
          ret(null);
        }
      });
    }
  ]
});
