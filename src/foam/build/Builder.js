/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'Builder',
  requires: [
    'foam.build.DirWriter',
    'foam.build.FilesJsGen',
    'foam.build.DirCrawlModelDAO'
  ],
  properties: [
    {
      name: 'srcDirs',
      factory: function() {
        return [global.FOAM_ROOT]
      },
    },
    {
      name: 'targetFile',
      value: 'foam-bin.js'
    }
  ],
  methods: [
    function embedModelDAO(dao) {
      return new Promise(function(resolve, reject) {
        var payload = `(function() {

foam.__context__ = foam.build.ClassLoaderContext.create().__subContext__;

var resolve;
var promised = foam.build.PromisedClassLoader.create({
  delegate: new Promise(function(r) { resolve = r; })
});

foam.__context__ = foam.__context__.createSubContext({
  classloader: promised
});

(async function() {
console.log("Seeding modeldao");

var classloader = foam.build.ClassLoaderImpl.create();

var modelDAO = foam.dao.EasyDAO.create({
daoType: 'MDAO',
of: foam.core.Model
});

classloader.modelDAO = modelDAO;

var x = foam.__context__.createSubContext({
  classloader: classloader
});

var deserializer = foam.json2.Deserializer.create();
`;

        var serializer = foam.json2.Serializer.create();

        // Any FObject has what we will call "dependencies" which are
        // classes that it referes to either by containing instances
        // of those classes or references to those classes.

        // We do a topological sort of models based upon their
        // dependency graph.  This ensures that the modelDAO can be
        // seeded and loaded sequentially.

        function dependencies(m) {
          var deps = {};

          function visit(o) {
            if ( foam.Array.isInstance(o) ){
              o.forEach(visit);
            } else if ( foam.core.FObject.isInstance(o) ) {
              if ( o.cls_.id  == m.id ) { console.log("Instance of self referencE"); }
              deps[o.cls_.id] = true;

              o.cls_.getAxiomsByClass(foam.core.Property).
                filter(function(p) {
                  return ! o.hasDefaultValue(p.name);
                }).
                forEach(function(p) {
                  var value;
                  try {
                    value = p.f(o);
                  } catch(e) {
                    throw e;
                  }
                  visit(value);
                });
            } else if ( foam.core.FObject.isSubClass(o) ) {
              if ( o.id  !== m.id )
                deps[o.id] = true;
            }
          }

          visit(m);
          return Object.keys(deps);
        }

        dao.select().then(function(a) {
          var models = a.array;
          var nodes = [];
          var edges = [];
          var L = [];
          var S = [];

          models.forEach(function(model) {
            nodes.push(model.id);
            dependencies(model).
              forEach(function(dep) {
                edges.push([model.id, dep]);
              });
          });

          // Exclude dependencies that live outside the modeldao.
          edges = edges.filter(e => nodes.indexOf(e[0]) != -1 && nodes.indexOf(e[1]) != -1);

          edges.forEach(e => console.log(e[0] + " -> " + e[1]));

          function replace(s) { return s.replace(/\./g, "_"); }

          S = nodes.filter(n => ! edges.some(e => e[1] == n));

          while ( S.length ) {
            var n = S.shift();
            L.push(n);
            nodes.forEach(function(m) {
              for ( var i = 0 ; i < edges.length ; i++ ) {
                var e = edges[i];
                if ( e[0] == n && e[1] == m ) {
                  edges = edges.slice(0, i).concat(edges.slice(i + 1));
                  if ( ! edges.some(e => e[1] == m ) ) {
                    S.push(m);
                  }
                }
              }
            });
          }

          if ( edges.length ) {
            reject("Cyclic dependencies: " + edges);
            return;
          }

          L.reverse();

          console.log('Address', L.indexOf('foam.nanos.auth.Address'));
          console.log('Region', L.indexOf('foam.nanos.auth.Region'));
          console.log('Country', L.indexOf('foam.nanos.auth.Country'));

          console.log('Mode', L.indexOf('foam.nanos.app.Mode'));
          console.log('AppConfig', L.indexOf('foam.nanos.app.AppConfig'));
          //          console.log('Country', L.indexOf('foam.nanos.auth.Country'));

          L.forEach(l => console.log(l));


          models.sort((a, b) => L.indexOf(a.id) > L.indexOf(b.id));

          models.forEach(function(m) {
            payload += `// ${m.id}
modelDAO.put(await deserializer.aparse(x, ${serializer.stringify(foam.__context__, m)}));
`;
            //modelDAO.put(deserializer.parse(foam.__context__, ${serializer.stringify(foam.__context__, m)}));
          });
          payload += `
resolve(classloader);
console.log("Done.");
})();
})();
`;

          resolve(payload);
        });
      });

/*
        dao.select({
          put: function(m) {
            payload += `// ${m.id}
deserializer.aparse(foam.__context__, ${serializer.stringify(foam.__context__, m)}));
`;
          },
          eof: function() {
            payload += `
console.log("Done.");
window.modelDAO = modelDAO;
})();
`
            resolve(payload);
          }
        }).catch(function(e) { reject(e); });
      });*/
    },

    function buildBootstrap() {
      var files = [];

      var context = {
        FOAM_FILES: function(f) {
          files = f;
        }
      };

      with(context) {
        eval(require('fs').readFileSync(global.FOAM_ROOT + 'files2.js', { encoding: 'utf8' }));
      }

      return files.reduce(function(s, f) {
        return s + '\n' +
          require('fs').readFileSync(global.FOAM_ROOT + f.name + '.js', { encoding: 'utf8' });
      }, '');
    },

    function execute() {
      var self = this;

      var modelDAO = this.DirCrawlModelDAO.create({
        srcDir: global.FOAM_ROOT + 'foam/nanos',
        blacklist: [
          'src/foam/nanos.js'
        ]
      });

      var modelDAO = this.DirCrawlModelDAO.create({
        srcDir: global.FOAM_ROOT + 'test',
        blacklist: [
          'src/foam/nanos.js'
        ]
      });

      var foamjs = this.buildBootstrap()

      return this.embedModelDAO(modelDAO).then(function(s) {
        require('fs').writeFileSync('modeldao.js', s, { encoding: 'utf8' });
//        foamjs += s;
        return foamjs;
      }).then(function(payload) {
//        console.log(payload.length, "characters.");
        require('fs').writeFileSync(self.targetFile, payload, { encoding: 'utf8' });
      });

      return;
    }
  ]
});
