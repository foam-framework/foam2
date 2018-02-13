foam.CLASS({
  package: 'foam.apploader',
  name: 'NodeModelFileFetcher',
  properties: [
    'root',
  ],
  methods: [
    function getFile(id) {
      var self = this;
      return new Promise(function(ret, err) {
        var sep = require('path').sep;
        var path = self.root + sep + id.replace(/\./g, sep) + '.js';
        try {
          var fs = require('fs');
          var js = fs.readFileSync(path, 'utf8');
          ret(js);
        } catch(e) {
          err(null);
        }
      });
    },
  ]
});
