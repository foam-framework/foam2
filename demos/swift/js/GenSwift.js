foam.CLASS({
  name: 'GenSwift',
  requires: [
    'foam.core.Model',
    'foam.swift.SwiftClass',
    'foam.swift.Field',
    'foam.swift.Method',
  ],
  imports: [
    'arequire',
  ],
  properties: [
    {
      class: 'StringArray',
      name: 'models',
    },
    {
      class: 'String',
      name: 'outdir',
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
  ],
  methods: [
    function execute() {
      var self = this;
      if ( !this.outdir ) {
        console.log('ERROR: outdir not specified');
        process.exit(1);
      }
      self.fs.mkdirSync(this.outdir);
      var promises = [];
      for (var i = 0; i < this.models.length; i++) {
        promises.push(this.arequire(this.models[i]));
      }
      return Promise.all(promises).then(function() {
        var sep = require('path').sep;
        var resources = [];
        for (var i = 0; i < self.models.length; i++) {
          var cls = self.lookup(self.models[i], self);
          var fileName = self.outdir + sep + cls.id.replace(/\./g, '_') + '.swift';
          self.fs.writeFileSync(
              fileName,
              cls.toSwiftClass().toSwiftSource());
        }
      }).catch(function(err) {
        console.log('Error', err);
      });
    }
  ]
});
