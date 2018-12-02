/*
TODO:

 - Remove foam.classloader classes
 - Remove arequire, or change it to use classloader.load
 - Make GENMODEL work when running without a classloader
 - Fix WebSocketBox port autodetection to work when running with tomcat and also without


*/

foam.CLASS({
  package: 'foam.build',
  name: 'ClassLoaderImpl',
  implements: [
    'foam.build.ClassLoader'
  ],

  /* todo: [
    `Don't register classes globally, register in a subcontext so we can
have multiple classloaders running alongside eachother`
],*/
  requires: [
    'foam.dao.ArrayDAO',
    'foam.dao.Relationship',
    'foam.mlang.ExpressionsSingleton'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'modelDAO'
    }
  ],
  methods: [
    {
      name: 'load',
      async: true,
      returns: 'Class',
      args: [ { class: 'String', name: 'id' } ],
      code: function(id) {
        function log() {
          console.log.apply(console, ["**adamvy"].concat(Array.from(arguments)));
        }

        log("loading class", id);

        var E = this.ExpressionsSingleton.create();

        var self = this;

        var dependencies = {};

        async function depsForId(id) {
          // Already processed
          if ( dependencies[id] ) return;

          // Already loaded
          if ( self.__context__.lookup(id, true) ) return;

          var model = await self.modelDAO.find(id);

          if ( ! model ) throw new Error("Unable to find model: " + id);

          await depsForModel(model);
        }

        async function depsForModel(model) {
          log("Dependencies of", model.id)
          if ( dependencies[model.id] ) return;

          dependencies[model.id] = { model: model };

          if ( model.extends ) await depsForId(model.extends)

          if ( model.implements )
            await Promise.all(model.implements.map(i => depsForId(i.path)));

          if ( model.requires )
            await Promise.all(model.requires.map(i => depsForId(i.path)));

          var refinements = (await self.modelDAO.
                             where(E.AND(E.INSTANCE_OF(foam.core.Model),
                                         E.EQ(foam.core.Model.REFINES, id))).
                             select()).array;

          dependencies[model.id].refinements = refinements;

          await Promise.all(refinements.map(depsForModel));

          var relationships = (await self.modelDAO.
                               where(E.AND(E.INSTANCE_OF(foam.dao.Relationship),
                                           E.OR(E.EQ(foam.dao.Relationship.SOURCE_MODEL,
                                                     id),
                                                E.EQ(foam.dao.Relationship.TARGET_MODEL,
                                                     id)))).
                               select()).array;

          await Promise.all(relationships.map(depsForModel));

          dependencies[model.id].relationships = relationships;
        }

        var x = self.__context__;

        log("computing dependencies");
        return depsForId(id).then(function() {
          var models = Object.keys(dependencies);

          log("We will load/latch all of:");
          models.forEach(function(f) { log(f); });

          models.forEach(function(id) {
            foam.UNUSED[id] = true;
            var model = dependencies[id].model;
            var refinements = dependencies[id].refinements || [];
            var relationships = dependencies[id].relationships || [];

            // Register all normal class models
            if ( foam.core.Model.isInstance(model) && ! model.refines ) {
              log("Latching", model.id);
              x.registerFactory(model, foam.Function.memoize0(function() {
                log(model.id, "triggered");
                model.validate();

                delete foam.UNUSED[model.id];
                foam.USED[model.id] = true;

                var cls = model.buildClass();
                cls.validate();

                x.register(cls);

                log(model.id, "class built, now doing refinements");

                refinements.forEach(function(r) {
                  log("building", r.id);
                  r.buildClass(x);
                });

                log(model.id, "now relationships");

                relationships.forEach(function(r) {
                  log("initializing", r.id);
                  r.initRelationship(x);
                });

                return cls;
              }));
            }
          });

          return x.lookup(id);
        });

        return cls;
      }
    }
  ]
});
