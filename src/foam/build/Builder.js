/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'Builder',
  requires: [
    'foam.mlang.ExpressionsSingleton',
  ],
  properties: [
    {
      name: 'srcDirs',
      factory: function() {
        return [global.FOAM_ROOT]
      },
    },
    {
      class: 'StringArray',
      name: 'blacklist',
    },
    {
      name: 'blacklist_',
      value: [
        'foam.apploader.ClassLoaderContextScript',
        'foam.apploader.ClassLoaderContext'
      ]
    },
    {
      name: 'enabledFeatures',
    },
    {
      name: 'targetFile',
      value: 'foam-bin.js'
    }
  ],
  methods: [
    function xembedModelDAO(dao) {
      var self = this;
      return (async function() {
        var models = (await dao.select()).array;
        var serializer = foam.json2.Serializer.create();
        return `(function() {
foam.__context__ = foam.build.ClassLoaderContext.create().__subContext__;

var classloader = foam.build.ClassLoaderImpl.create();

var modelDAO = foam.dao.EasyDAO.create({
  daoType: 'MDAO',
  of: foam.core.Model
});

var resolve;
var promised = foam.build.PromisedClassLoader.create({
  delegate: new Promise(function(r) { resolve = r; })
});

classloader.modelDAO = modelDAO;

x = foam.__context__.createSubContext({
  classloader: classloader
});

foam.__context__ = x.createSubContext({
  classloader: promised
});

var deserializer = foam.json2.Deserializer.create(null, x);

Promise.all([
${models.map(m => serializer.stringify(self.__context__, m)).join(',\n')}
]).then(function() {
  resolve(classloader);
});

})();`;
      })();
    },
    function embedModelDAO(dao) {
      var self = this;
      return (async function() {
        var payload;
        var E = self.ExpressionsSingleton.create();
//        dao = dao.where(E.EQ(foam.core.Model.PACKAGE, "test"));

        var models = (await dao.select()).array;

        function visit(a, m) {
          if ( foam.Array.isInstance(m) ) {
            m.forEach(o => visit(a, o));
          } else if ( foam.core.FObject.isInstance(m) ) {
            var cls = m.cls_;

            a.push(cls);

            var props = cls.getAxiomsByClass(foam.core.Property);

            for ( var i = 0 ; i < props.length ; i++ ) {
              var prop = props[i];

              if ( ! m.hasDefaultValue(prop.name) )
                visit(a, m[prop.name]);
            }
          } else if ( foam.core.FObject.isSubClass(m) ) {
            a.push(m);
          }

          return a;
        }
        var allclasses = visit([], models);

        allclasses.sort(function(a, b) { return a.id < b.id; });

        function isSorted(a, comp) {
          if ( a.length < 2 ) return true;

          for ( var i = 0 ; i < a.length - 1 ; i++ ) {
            if ( comp(a[i], a[i+1]) > 0 ) {
              return false;
            }
          }
          return true;
        }

        var comp = function(a, b) { return a.id.localeCompare(b.id); };

        allclasses.sort(comp);

        var classes = allclasses.reduce(function(a, v, i, s) {
          if ( v !== a[a.length - 1] ) a.push(v);
          return a;
        }, []);

//        console.log("=== START REQUIRED CLASSES ===");
//        classes.forEach((c, i) => console.log(c.id, i));
//        console.log("=== END REQUIRED CLASSES ===");

        var data = {};
        var serializer = foam.json2.Serializer.create();

        // var staticCodeGen = self.JsCodeOutputter.create();

        var a = 1;
//        payload = classes.map(function(c) {
//          return `console.log(${a++});
//${staticCodeGen.stringify(self.__context__, c.model_)}`
//        }).join('\n');

        models.forEach(function(m) {
          data[m.id] = m;
        });

        return `
(function() {
foam.__context__ = foam.build.ClassLoaderContext.create().__subContext__;

var classloader = foam.build.ClassLoaderImpl.create();

foam.__context__ = foam.__context__.createSubContext({
  classloader: classloader
});

var modelDAO = foam.build.EmbeddedModelDAO.create({
  delegate: foam.dao.EasyDAO.create({
    daoType: 'MDAO',
    of: foam.core.Model
  })
}, classloader);

//var modelDAO = foam.dao.EasyDAO.create({
//  daoType: 'MDAO',
//  of: foam.core.Model
//});


classloader.modelDAO = modelDAO;

modelDAO.json = ${serializer.stringify(self.__context__, data)};
})();`;
      })();

        /*
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

var modelDAO = foam.build.EmbeddedModelDAO.create({
  delegate: foam.dao.EasyDAO.create({
    daoType: 'MDAO',
    of: foam.core.Model
  })
});

classloader.modelDAO = modelDAO;

var x = foam.__context__.createSubContext({
  classloader: classloader
});

//var deserializer = foam.json2.Deserializer.create();
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

        var models = (await dao.select()).array;
        console.log("===== models =====");
        models.forEach(function(m) { console.log(m.refines, m.package, m.name); });
        console.log("=====");
        var nodes = [];
        var edges = [];
        var L = [];
        var S = [];

        models.forEach(function(model) {
          nodes.push(model.id);
          dependencies(model).
            filter(function(dep) { return dep !== model.id; }).
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
          throw new Error("Cyclic dependencies: " + edges);
        }

        L.reverse();

        console.log("Sorted");

        L.forEach(l => console.log(l));

        for ( var i = 0 ; i < L.length ; i++ ) {
          var m = await dao.find(L[i]);
          payload += `// ${m.id}
modelDAO.put(await deserializer.aparse(x, ${serializer.stringify(foam.__context__, m)}));
`;
        }

        payload += `
resolve(classloader);
console.log("Done.");
})();
})();

`;

        return payload;
      })();
*/
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

      var E = foam.mlang.ExpressionsSingleton.create();

      var modelDAO = foam.dao.EasyDAO.create({
        daoType: 'MDAO',
        of: foam.core.Model
      });

      var pred = self.enabledFeatures.map(f => E.IN(f, foam.core.Model.FLAGS))
      pred.push(E.NOT(E.HAS(foam.core.Model.FLAGS)));
      pred = E.OR.apply(E, pred);

      modelDAO = modelDAO.where(pred).orderBy(foam.core.Model.ORDER)

      function inflate(model) {
        return model.cls_ ? model :
          foam.lookup(model.class || 'foam.core.Model').create(model);
      }

      // Load all class models from USED/UNUSED
      Object.
        keys(foam.UNUSED).
        map(k => foam.UNUSED[k]).
        concat(Object.keys(foam.USED).
               map(k => foam.USED[k])).
        forEach(function(m) {
          modelDAO.put(inflate(m));
        });

      // Instantiate models for SCRIPTs, LIBs, and RELATIONSHIPs.
      foam.__SCRIPTS__.forEach(function(s) {
        s.class = 'foam.core.Script';
        modelDAO.put(inflate(s));
      });

      (function() {
        var libs = {};
        foam.__LIBS__.forEach(function(l) {
          if ( ! foam.Number.isInstance(libs[l.name])) libs[l.name] = 0;
          l.iteration = libs[l.name]++;
          l.class = 'foam.build.Library';
          modelDAO.put(inflate(l));
        });
      })();

      (foam.__RELATIONSHIPS__ || []).forEach(function(r) {
        r.class = 'foam.dao.Relationship';
        modelDAO.put(inflate(r));
      });

      var serializer = foam.json.Outputter.create({
        pretty: true,
        strict: false,
        outputDefaultValues: true, // TODO This makes it impossible to remove the label on an action.
        passPropertiesByReference: false,
        propertyPredicate: function(o, p) {
          return o.hasOwnProperty(p.name) &&
            ! p.storageTransient;
        }
      });

      function bootstrap(then, abort) {
        then([
          { name: "foam/core/poly" },
          { name: "foam/core/lib" },
          { name: "foam/core/stdlib" },
          { name: "foam/core/events" },
          { name: "foam/core/cps" },
          { name: "foam/core/Context" },
          { name: "foam/core/Boot" },
          { name: "foam/core/FObject" },
          { name: "foam/core/Model" },
          { name: "foam/core/Property" },
          { name: "foam/core/Simple" },
          { name: "foam/core/Method" },
          { name: "foam/core/Boolean" },
          { name: "foam/core/AxiomArray" },
          { name: "foam/core/EndBoot" }
        ].reduce(function(s, f) {
          return s + '\n' + require('fs').
            readFileSync(global.FOAM_ROOT + f.name + '.js', { encoding: 'utf8' });
        }, ''));
      }

      var fd = require('fs').openSync(self.targetFile, 'w');

      function models(then, abort) {
        var data = '';

        var blacklist = self.blacklist_.concat(self.blacklist)

        modelDAO.orderBy(foam.core.Model.ORDER).select({
          put: function(s) {
            if ( blacklist.indexOf(s.id) != -1 ) {
              console.log("Skipping", s.id);
              return;
            }

            var func = foam.core.Model.isInstance(s) ? 'CLASS' :
                foam.dao.Relationship.isInstance(s) ? 'RELATIONSHIP' :
                foam.build.Library.isInstance(s) ? 'LIB' :
                foam.core.Script.isInstance(s) ? 'SCRIPT' : 'UNKNOWN';

            if ( func == 'UNKNOWN' ) throw new Error("What's the right foam.FOO function for a " + s.cls_.id);

            // Print FOAM model definition
            dataTmp = `foam.${func}(${serializer.stringify(filterAxiomsByFlags(s))});\n`
            // Print sourceURL annotation for browser inpector
            if ( typeof s.source !== 'undefined' ) {
              dataTmp += `\n//# sourceURL=/`+s.source;
            }
            // eval() is necessary for `//# sourceURL` to work
            data += 'eval(' + JSON.stringify(dataTmp) + ');\n';
          },
          eof: function() { then(data); }
        });
      }

      function write(then, abort, data) {
        require('fs').writeSync(fd, Buffer.from(data, 'utf8'));
        then();
      }

      function close(then, abort) {
        require('fs').closeSync(fd);
        then();
      }

      var flagFilter = foam.util.flagFilter(this.enabledFeatures);
      function filterAxiomsByFlags(o) {
        var self = this;
        var type = foam.typeOf(o);
        if ( type == foam.Array ) {
          return o.filter(flagFilter).map(function(obj) {
            return filterAxiomsByFlags(obj);
          });
        } else if ( type == foam.Object ) {
          // Check if it's an actual class. foam.core.FObject.isSubClass
          // should work but doesn't:
          // https://github.com/foam-framework/foam2/issues/1023
          if ( o && o.prototype &&
               ( foam.core.FObject.prototype === o.prototype ||
                 foam.core.FObject.prototype.isPrototypeOf(o.prototype) ) ) {
            return o;
          }
          var fo = {};
          Object.keys(o).forEach(function(k) {
            fo[k] = filterAxiomsByFlags(o[k]);
          });
          return fo;
        } else if ( type == foam.core.FObject ) {
          var fo = {};
          o.cls_.getAxiomsByClass(foam.core.Property)
            .filter(flagFilter)
            .filter(function(axiom) {
              return o.hasOwnProperty(axiom.name);
            })
            .forEach(function(axiom) {
              fo[axiom.name] = filterAxiomsByFlags(o[axiom.name]);
            });
          return o.cls_.create(fo);
        }
        return o;
      }

      with ( foam.cps ) {
        sequence(
          compose(write, wrap(function() {
            return "FOAM_FLAGS = { js: true, web: true, debug: true, java: true, swift: true };\n";
          })),
          compose(write, bootstrap),
          compose(write, models),
          wrap(function() {
            require('fs').closeSync(fd);
          }))(nop, function(error) {
            console.log("Error building payload", error);
          });
      }

      return;

    }
  ]
});
