/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'ClassLoaderImpl',
  implements: [
    'foam.build.ClassLoader'
  ],
  requires: [
    'foam.dao.ArrayDAO',
    'foam.dao.Relationship',
    'foam.mlang.ExpressionsSingleton'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'modelDAO'
    },
    {
      class: 'Map',
      name: 'loading'
    }
  ],
  exports: [
    'aref'
  ],
  methods: [
    {
      class: 'ContextMethod',
      name: 'aref',
      async: true,
      type: 'Any',
      args: [ { class: 'String', name: 'id' } ],
      code: function(x, id) {
        // In order to avoid circular dependencies, we resolve references lazily.
        return Promise.resolve({ "$REF$": id });
      }
    },
    {
      name: 'resolveReferences',
      code: function(o) {
        var self = this;

        function visit(o) {
          if ( foam.Object.isInstance(o) && o["$REF$"] ) {
            return foam.lookup(o["$REF$"]);
          } else if ( foam.Array.isInstance(o) ) {
            for ( var i = 0 ; i < o.length ; i++ ) {
              o[i] = visit(o[i]);
            }
          } else if ( foam.core.FObject.isInstance(o) ) {
            var props = o.cls_.getAxiomsByClass(foam.core.Property);

            if ( foam.core.Model.isInstance(o) ) {
              // Workaround for model's psuedo properties that all have postsets.
              props = [o.cls_.AXIOMS_];
            }

            for ( var i = 0 ; i < props.length ; i++ ) {
              var p = props[i];

              if ( ! o.hasDefaultValue(p.name) )
                o[p.name] = visit(p.f(o));
            }
          }

          return o;
        }

        return visit(o);
      }
    },
    {
      name: 'load',
      async: true,
      code: function(id) {
        var self = this;

        var E = this.ExpressionsSingleton.create();

        if ( this.loading[id] ) return this.loading[id];

        var deps = {};

        function latch(model) {
          if ( ! foam.core.Model.isInstance(model) ) {
            console.warn("Tried to latch non model" + model.id);
            return;
          }

          if ( foam.__context__.isRegistered(model.id) ) {
            return;
          }

          foam.UNUSED[model.id] = model;

          var f = foam.Function.memoize0(function() {
            model = self.resolveReferences(model);

            delete foam.UNUSED[model.id];

            model.validate();

            var cls = model.buildClass();
            cls.validate();

            foam.register(cls);

            self.pub('load', model.id);

            foam.USED[model.id] = true;

            done = true;
            return cls;
          });

          foam.__context__.registerFactory(model, f);

          return model;
        }

        function dep(id) {
          if ( deps[id] ||
               foam.__context__.isRegistered(id) )
            return Promise.resolve();

          deps[id] = true;

          return load(id).then(function(m) {
            latch(m);
            return m;
          });
        }

        function load(id) {
          return self.modelDAO.find(id).then(function(m) {
            if ( ! m ) throw new Error("No model found for id: " + id);
            return refs(m).then(function() {
              return classDeps(m);
            }).then(function() {
              return refinements(m);
            }).then(function() {
              return relationships(m);
            }).then(function() {
              return m;
            });
          });
        }

        function aforeach(array, f) {
          var i = 0;
          function iter(i) {
            return i < array.length ? f(array[i]).then(function() { return iter(i + 1); }) :
                Promise.resolve();
          }

          return iter(0);
        }

        function refs(obj) {
          function visitFObject(obj) {
            var props = obj.cls_.getAxiomsByClass(foam.core.Property);

            if ( foam.core.Model.isInstance(obj) ) {
              // Workaround for model's psuedo properties that all have postsets.
              props = [obj.cls_.AXIOMS_];
            }

            return aforeach(props, function(prop) {
              if ( obj.hasDefaultValue(prop.name) ) return Promise.resolve();

              return visit(prop.f(obj));
            });
          }

          function visit(o) {
            if ( foam.Object.isInstance(o) && o["$REF$"] ) {
              return dep(o["$REF$"]);
            } else if ( foam.Array.isInstance(o) ) {
              return aforeach(o, visit);
            } else if ( foam.core.FObject.isInstance(o) ) {
              return visitFObject(o);
            }
            return Promise.resolve();
          }

          return visit(obj);
        }


        function classDeps(model) {
          var deps = [];
          if ( model.requires ) deps = deps.concat(model.requires.map(r => r.path));
          if ( model.implements ) deps = deps.concat(model.implements.map(i => i.path));
          if ( model.extends ) deps.push(model.extends);

          return aforeach(deps, dep);
        }

        function refinements(model) {
          return self.modelDAO.
            where(E.AND(E.INSTANCE_OF(foam.core.Model),
                        E.EQ(foam.core.Model.REFINES, model.id))).
            select().then(function(a) {
              return aforeach(a.array, function(m) {
                self.sub("load", model.id, function() {
                  m = self.resolveReferences(m);
                  m.buildClass();
                });

                return Promise.resolve();
              });
            });
        }

        function relationships(model) {
          return self.modelDAO.
            where(E.AND(E.INSTANCE_OF(foam.dao.Relationship),
                        E.OR(E.EQ(foam.dao.Relationship.SOURCE_MODEL, model.id),
                             E.EQ(foam.dao.Relationship.TARGET_MODEL, model.id)))).
            select().then(function(a) {
              return aforeach(a.array, function(m) {
                // TODO: Should sourceModel/targetModel be REFS?
                return dep(m.sourceModel).then(function() {
                  return dep(m.targetModel);
                }).then(function() {
                  self.sub("load", model.id, function() {
                    m = self.resolveReferences(m);
                    m.initRelationship();
                  });
                })
              })
            });
        }

        return this.loading[id] = dep(id).then(function() {
          delete self.loading[id];
          return foam.lookup(id);
        });

      }
    }
  ]
});
