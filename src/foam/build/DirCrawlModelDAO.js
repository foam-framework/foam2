/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'DirCrawlModelDAO',
  extends: 'foam.dao.PromisedDAO',
  requires: [
    'foam.build.Lib',
    'foam.core.Script',
    'foam.dao.EasyDAO',
    'foam.dao.Relationship',
  ],
  properties: [
    {
      name: 'unwrappedScripts',
      value: [
        'src/foam/core/stdlib\\.js',
        'src/foam/core/events\\.js',
        'src/foam/core/Boot\\.js',
        'src/foam/core/FObject\\.js',
        'src/foam/core/Model\\.js',
        'src/foam/core/Boolean\\.js',
        'src/foam/core/AxiomArray\\.js',
        'src/foam/core/EndBoot\\.js',
      ],
    },
    {
      name: 'blacklist',
      value: [
        // Boot files that cannot be wrapped in foam.SCRIPT
        'src/foam\\.js',
        'src/foam/core/poly\\.js',
        'src/foam/core/lib\\.js',

        // Not models.
        'src/foam/nanos/nanos\\.js',
        'src/files\\.js',

        // Dirs we don't care about.
        'src/com/*',
        'src/apps/*',

        // Test files.
        'src/lib/dao_test\\.js',
        'src/foam/box/node/forkScript\\.js',
      ],
    },
    {
      name: 'delegate',
      factory: function() { return this.EasyDAO.create({daoType: 'MDAO', of: 'foam.core.Model'}); },
    },
    {
      name: 'promise',
      factory: function() {
        var self = this;
        return self.fillDAO(self.delegate).then(function() {
          return self.delegate;
        });
      },
    },
    {
      name: 'srcDir',
      adapt: function(_, n) {
        return n.replace(/\/$/, '');
      },
      factory: function() {
        return global.FOAM_ROOT;
      },
    },
  ],
  methods: [
    function fillDAO(dao) {
      var self = this;

      var promises = [];

      var context = {
        foam: Object.create(foam)
      };

      context.foam.LIB = function(m) {
        if ( ! m.id ) {
          m.id = m.name + '.' + m.methods[0].name;
        }
        promises.push(dao.put(self.Lib.create({
          id: m.id,
          json: m,
        })));
      };

      context.foam.SCRIPT = function(m) {
        promises.push(dao.put(self.Script.create(m)));
      };

      context.foam.ENUM = function(m) {
        m.class = m.class || 'foam.core.EnumModel',
        context.foam.CLASS(m);
      };

      context.foam.INTERFACE = function(m) {
        m.class = m.class || 'foam.core.InterfaceModel',
        context.foam.CLASS(m);
      };

      context.foam.CLASS = function(m) {
        promises.push(Promise.all(foam.json.references(self.__context__, m)).then(function(p) {
          var cls = self.lookup(m.class || 'foam.core.Model')
          return dao.put(cls.create(m));
        }))
      };

      context.foam.RELATIONSHIP = function(m) {
        var r = self.Relationship.create(m);
        return dao.put(r);
      };

      var self = this;
      var scriptFilesExp = new RegExp(self.unwrappedScripts.join('|'));
      var blacklistExp = new RegExp(self.blacklist.join('|'));

      var fs = require('fs');
      var sep = require('path').sep;
      self.ftw(self.srcDir, function(path, lstat) {
        if ( ! lstat.isFile() ) return;
        if ( blacklistExp.exec(path) ) return;

        var o = fs.readFileSync(path, 'utf-8');

        if ( scriptFilesExp.exec(path) ) {
          // Remove extension and append 'Script' to name.
          var n = path.split(sep).pop().replace(/\.js$/, '') + 'Script';
          with ( context ) {
            foam.SCRIPT({
              package: 'foam.core',
              name: n,
              code: new Function(o),
            });
          }
        } else if ( path.endsWith('.js') ) {
          try {
            with ( context ) { eval(o) };
          } catch(e) {
            console.log(e);
          }
        } else if ( path.endsWith('.java') ) {
          // TODO: Add a JavaClass model for manually written java classes.
          // Parse the package/name from the .java and then store them in the DAO as
          // well. Also do the same for swift files.
        }
      });

      return Promise.all(promises);
    },
    function ftw(dir, fn) {
      var fs = require('fs');
      var sep = require('path').sep;
      var dirs = [this.srcDir];
      while ( dirs.length ) {
        var dir = dirs.pop();
        fs.readdirSync(dir).forEach(function(f) {
          var path = dir + sep + f;
          var lstat = fs.lstatSync(path);
          if ( lstat.isDirectory() ) dirs.push(path)
          fn(path, lstat)
        })
      }
    },
    function execute() {
      this.select().then(function(a) {
        console.log(a.array.map(function(o) { return o.id }).join('\n'));
      });
    },
  ],
});
