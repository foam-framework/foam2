/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
TODO:

 - Remove foam.classloader classes
 - Remove arequire, or change it to use classloader.load
 - Make GENMODEL work when running without a classloader
 - Fix WebSocketBox port autodetection to work when running with tomcat and also without


*/

foam.CLASS({
  package: 'foam.apploader',
  name: 'ClassLoader',
  /* todo: [
    `Don't register classes globally, register in a subcontext so we can
have multiple classloaders running alongside eachother`
],*/
  requires: [
    'foam.classloader.OrDAO',
    'foam.core.Script',
    'foam.dao.Relationship',
    'foam.apploader.SubClassLoader',
    {
      path: 'foam.apploader.WebModelFileDAO',
      flags: ['web'],
    },
    {
      path: 'foam.apploader.NodeModelFileDAO',
      flags: ['node'],
    },
    {
      path: 'foam.foamlink.FoamlinkNodeModelFileDAO',
      flags: ['node'],
    },
  ],
  properties: [
    {
      class: 'Map',
      name: 'pending'
    },
    {
      class: 'Map',
      name: 'latched'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'modelDAO'
    }
  ],
  methods: [
    {
      name: 'addClassPath',
      code: function(path) {
        var cls = this[
          foam.isServer
          ? (foam.hasFoamlink ? 'FoamlinkNodeModelFileDAO' : 'NodeModelFileDAO')
          : 'WebModelFileDAO'
        ];
        var modelDAO = cls.create({root: path}, this);

        if ( this.modelDAO ) {
          modelDAO = this.OrDAO.create({
            primary: this.modelDAO,
            delegate: modelDAO
          });
        }
        this.modelDAO = modelDAO;
      }
    },
    {
      name: 'load',
      type: 'Class',
      async: true,
      args: [ { class: 'String', name: 'id' } ],
      code: function(id) {
        return this.load_(id, []);
      }
    },
    {
      name: 'maybeLoad',
      type: 'Class',
      async: true,
      documentation: "Like load, but don't throw if not found.",
      args: [ { name: 'id', type: 'String' } ],
      code: function(id) {
        return this.load(id).catch(function() {
          console.warn.apply(console, ["Failed to load", id].concat(Array.from(arguments)));
          return null;
        });
      }
    },
    {
      name: 'maybeLoad_',
      type: 'Class',
      async: true,
      args: [ { name: 'id', type: 'String' },
              { name: 'path', type: 'String[]' } ],
      code: function(id, path) {
        return this.load_(id, path).catch(function() { return null; });
      }
    },
    {
      name: 'latch',
      type: 'Class',
      async: true,
      args: [ { name: 'json' } ],
      code: function(json) {
        var id = json.package ?
            json.package + '.' + json.name :
            json.name;

        this.latched[id] = json;
      }
    },
    {
      name: 'load_',
      type: 'Class',
      async: true,
      args: [ { name: 'id', type: 'String' },
              { name: 'path', type: 'String[]' } ],
      code: function(id, path) {
        var self = this;

        if ( foam.String.isInstance(id) ) {
          // Prevent infinite loops, if we're loading this class as a
          // dependency to something that this class depends upon then
          // we can just resolve right away.
          for ( var i = 0 ; i < path.length ; i++ ) {
            if ( path[i] === id ) return Promise.resolve();
          }

          if ( this.pending[id] ) return this.pending[id];
          path = path.concat(id);

          // Latched models come from when someone defines a class
          // with foam.CLASS during regular execution (like a script
          // tag).  We hook into those so that they can still use the
          // classloader to ensure any dependencies of that model are
          // loaded before they use it.
          var subClassLoader = self.SubClassLoader.create({delegate: self, path: path});
          if ( this.latched[id] ) {
            var json = this.latched[id];
            delete this.latched[id];
            return this.pending[id] = Promise.all(foam.json.references(subClassLoader.__subContext__, json)).then(function() {
              var cls = json.class ? foam.lookup(json.class) : foam.core.Model;
              return self.modelDeps_(cls.create(json), path);
            }).then(function() {
              // Latched models will already be registered in the
              // context via foam.CLASS as defined in EndBoot.js
              return foam.lookup(id);
            });
          }

          if ( foam.lookup(id, true) ) return Promise.resolve(foam.lookup(id));

          return this.pending[id] = this.modelDAO.inX(subClassLoader).find(id).then(function(m) {
            if ( ! m ) return Promise.reject(new Error('Model Not Found: ' + id));
            if ( self.Relationship.isInstance(m) ) {
              return m.initRelationship();
            }
            if ( self.Script.isInstance(m) ) {
              return Promise.all(m.requires.map(function(r) {
                return self.load(r)
              })).then(function() {
                m.code()
                return m;
              });
            }
            return this.buildClass_(m, path);
          }.bind(this), function(e) {
            throw e ? new Error("Failed to load class " + id + ".  Caused by: " + e.message) :
              new Error("Failed to load class " + id);
          });
        }

        if ( foam.core.Model.isInstance(id) ) {
          return this.pending[id.id] = this.buildClass_(id, path);
        }

        throw new Error("Invalid parameter to ClassLoader.load_");
      }
    },
    {
      name: 'modelDeps_',
      args: [ { name: 'model', type: 'Model' },
              { name: 'path' } ],
      code: function(model, path) {
        var self = this;
        return Promise.all(model.getClassDeps().map(function(d) {
          return self.maybeLoad_(d, path);
        }));
      }
    },
    {
      name: 'buildClass_',
      args: [ { name: 'model', type: 'Model' },
              { name: 'path', type: 'String[]' } ],
      code: function(model, path) {
        var self = this;

        var deps = this.modelDeps_(model, path);

        return deps.then(function() {
          model.validate();
          cls = model.buildClass();
          cls.validate();

          if ( ! model.refines ) {
            // Register class in global context.
            foam.register(cls);

            // Register the class in the global package path.
            foam.package.registerClass(cls);
          } else if ( model.name ) {
            // Register refinement id in global context.
            foam.register(cls, ( model.package || 'foam.core' ) + '.' + model.name);
          }
          // TODO(markdittmer): Identify and name anonymous refinements with:
          // else {
          //   console.warn('Refinement without unique id', cls);
          //   debugger;
          // }

          delete foam.UNUSED[model.id]
          foam.USED[model.id] = model
          return cls;
        });
      }
    }
  ]
});
