/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'FilesJsGen',
  requires: [
    'foam.build.DirCrawlModelDAO',
    'foam.build.Lib',
    'foam.build.StrippedModelDAO',
    'foam.core.Model',
    'foam.core.Script',
    'foam.dao.Relationship',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  constants: [
    {
      name: 'DEP_KEYS',
      factory: function() {
        var specialKeys = {};
        [
          'of',
          'class',
          'view',
          'sourceModel',
          'targetModel',
          'refines',
        ].forEach(function(k) { specialKeys[k] = true; });
        return specialKeys;
      }
    },
    {
      name: 'BOOT_FILES',
      documentation: `
        The following files must be added to files.js first and in this
        specific order.
      `,
      value: [
        'foam/core/poly',
        'foam/core/lib',
      ],
    },
    {
      name: 'CORE_MODELS',
      documentation: `
        The following models must be added to files.js after boot and in this
        specific order.
      `,
      value: [
        'foam.core.stdlibScript',
        'foam.core.eventsScript',
        'foam.core.ContextScript',
        'foam.core.BootScript',
        'foam.core.FObjectScript',
        'foam.core.ModelScript',
        'foam.core.Property',
        'foam.core.Simple',
        'foam.core.AbstractMethod',
        'foam.core.Method',
        'foam.core.BootPhase2',
        'foam.core.BooleanScript',
        'foam.core.AxiomArrayScript',
        'foam.core.EndBootScript',
      ],
    },
    {
      name: 'PHASE_1',
      documentation: `
        The following models must be added to files.js second but their order
        does not matter and all of their dependencies will be automatically
        added first.
      `,
      value: [
        'foam.core.ContextMultipleInheritenceScript',
        'foam.core.DebugDescribeScript',
        'foam.core.ImplementsModelRefine',
        'foam.core.ImportExportModelRefine',
        'foam.core.ListenerModelRefine',
        'foam.core.MethodArgumentRefine',
        'foam.core.ModelConstantRefine',
        'foam.core.ModelRefinestopics',
        'foam.core.ModelRequiresRefines',
        'foam.core.ModelActionRefine',
        'foam.core.Promised',
        'foam.core.__Class__',
        'foam.core.__Property__',
      ],
    },
    {
      name: 'PHASE_2',
      documentation: `
        The following models must be added to files.js after PHASE_1. Their
        order doesn't matter as long as they're added after PHASE_1. Their
        dependencies will automatically be added first.
      `,
      value: [
        'foam.core.ModelRefinescss',
        'foam.core.WindowScript',
        'foam.net.WebLibScript',
      ],
    },
    {
      name: 'NANOS_MODELS',
      documentation: `
        These are the models needed for booting nanos.
      `,
      value: [
        'foam.blob.AbstractBlobService',
        'foam.blob.RestBlobService',
        'foam.box.PromisedBox',
        'foam.box.RPCReturnBox',
        'foam.box.SocketConnectBox',
        'foam.dao.JDAO',
        'foam.dao.PromisedDAO',
        'foam.nanos.notification.Notification',
        'foam.u2.search.TextSearchView',
      ],
    },
  ],
  properties: [
    {
      name: 'required',
      documentation: `
        These are the models to be loaded when files.js is finished loading.
      `,
      factory: function() { return this.NANOS_MODELS },
    },
    {
      name: 'srcDir',
      value: 'STRIPPED/src',
    },
    {
      name: 'modelDAO',
      expression: function(srcDir) {
        return this.DirCrawlModelDAO.create({srcDir: srcDir})
      },
    },
  ],
  methods: [
    function execute() {
      this.getFilesJs().then(console.log.bind(console));
    },
    function getFilesJs() {
      var self = this;
      var getTreeHead = function(pred) {
        return self.modelDAO
          .where(pred)
          .select()
          .then(function(s) {
            return self.getDepsTree(s.array)
          });
      };

      // Get all dependencies of models that are required.
      return getTreeHead(self.IN(self.Model.ID, self.required)).then(function(a) {
        var deps = {
          'foam.core.FObject': true,
          'foam.core.Model': true
        };
        var q = [a];
        while ( q.length ) {
          var n = q.pop();
          Object.keys(n).forEach(function(k) {
            if ( deps[k] ) return;
            deps[k] = true;
            q.push(n[k]);
          });
        }
        return Object.keys(deps);
      }).then(function(deps) {
        return Promise.all([
            getTreeHead(self.IN(self.Model.ID, self.CORE_MODELS)),
            getTreeHead(self.INSTANCE_OF(self.Lib)),
            getTreeHead(self.IN(self.Model.ID, self.PHASE_1)),
            getTreeHead(self.IN(self.Model.ID, self.PHASE_2)),
            getTreeHead(self.INSTANCE_OF(self.Script)),
            getTreeHead(
              self.OR(
                self.IN(self.Relationship.SOURCE_MODEL, deps),
                self.IN(self.Relationship.TARGET_MODEL, deps)
              ),
            ),
            getTreeHead(self.IN(self.Model.REFINES, deps)),
            getTreeHead(self.IN(self.Model.ID, self.required)),
        ])
      }).then(function(args) {
        return Promise.all(
          args.map(function(head) {

            var depthMap = {};
            var fillDepth = function(node, depth, seen) {
              var keys = Object.keys(node);
              for ( var i = 0 ; i < keys.length ; i++ ) {
                var k = keys[i];
                if ( seen[k] ) continue;
                if ( ( depthMap[k] || 0 ) > depth ) continue;
                depthMap[k] = depth;
                seen[k] = true;
                fillDepth(node[k], depth + 1, seen);
                delete seen[k];
              }
            };
            fillDepth(head, 0, {});
            var order = [];
            Object.keys(depthMap).forEach(function(k) {
              order[depthMap[k]] = order[depthMap[k]] || [];
              order[depthMap[k]].push(k);
            });
            order.reverse();
            order = [].concat.apply([], order);

            // Remove anyting not in the DAO. This can happen for inner classes
            // and enums. TODO: Would be nice if we didn't have to do this.
            return Promise.all(order.map(function(id) {
              return self.modelDAO.find(id);
            })).then(function(models) {
              return models.filter(function(m) { return !!m }).map(function(m) { return m.id });
            });
          })
        );
      }).then(function(args) {
        // Flatten args.
        args = [].concat.apply([], args);
        var files = [].concat(
          self.BOOT_FILES,
          self.CORE_MODELS,
          args).map(function(o) {
            return `{ name: "${o.replace(/\./g, '/')}" },`;
          });

        // Remove duplicates.
        files = files.filter(function(id, i) {
          return files.indexOf(id) == i;
        })

        var filesJs = `
if ( typeof window !== 'undefined' ) global = window;
FOAM_FILES([
  ${files.join('\n  ')}
]);
        `.trim();
        return filesJs
      });
    },
    function getDepsTree(o, seen, head) {
      var self = this;
      seen = seen || {};
      head = head || {};

      if ( foam.Array.isInstance(o) ) {
        return Promise.all(o.map(function(i) {
          return self.getDepsTree(i, seen, head);
        })).then(function() { return head });
      } else if ( foam.Object.isInstance(o) ) {
        // Check if it's an actual class. foam.core.FObject.isSubClass
        // should work but doesn't:
        // https://github.com/foam-framework/foam2/issues/1023
        if ( o && o.prototype &&
             ( foam.core.FObject.prototype === o.prototype ||
               foam.core.FObject.prototype.isPrototypeOf(o.prototype) ) ) {
          return self.modelDAO.find(o.id).then(function(m) {
            return self.getDepsTree(m, seen, head);
          });
        }
        var ps = [];
        return Promise.all(Object.keys(o).map(function(k) {
          if ( self.DEP_KEYS[k] && foam.String.isInstance(o[k]) ) {
            return self.modelDAO.find(o[k]).then(function(m) {
              return self.getDepsTree(m, seen, head);
            });
          }
          return self.getDepsTree(o[k], seen, head);
        })).then(function() { return head });
      } else if ( foam.core.FObject.isInstance(o) ) {
        var oHead = head;
        if ( self.Model.isInstance(o) ||
             self.Relationship.isInstance(o) ||
             self.Lib.isInstance(o) ||
             self.Script.isInstance(o) ) {
          if ( seen[o.id] ) {
            head[o.id] = seen[o.id]
            return Promise.resolve(head);
          }
          head[o.id] = {};
          seen[o.id] = head[o.id];
          head = head[o.id];
        }

        var map = {};
        o.cls_.getAxiomsByClass(foam.core.Property)
          .filter(function(a) {
            return o.hasOwnProperty(a.name);
          })
          .forEach(function(a) {
            map[a.name] = o[a.name];
          });
        var ps = [
          self.getDepsTree(map, seen, head),
          self.getDepsTree(o.cls_, seen, head),
        ];

        if ( self.Script.isInstance(o) ) {
          o.requires.forEach(function(r) {
            ps.push(self.modelDAO.find(r).then(function(m) {
              return self.getDepsTree(m, seen, head);
            }));
          });
        }

        if ( self.Model.isInstance(o) ) {
          o.getClassDeps().forEach(function(d) {
            ps.push(self.modelDAO.find(d).then(function(m) {
              return self.getDepsTree(m, seen, head);
            }));
          });
        }

        return Promise.all(ps).then(function() { return oHead });
      }
      return Promise.resolve(head);
    },
  ],
});
