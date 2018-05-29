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
    'foam.dao.Relationship',
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
      code: function(path, json2) {
        var cls = foam.lookup(foam.isServer ?
            'foam.apploader.NodeModelFileDAO' :
            'foam.apploader.WebModelFileDAO');
        var modelDAO = cls.create({root: path, json2: json2}, this);

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
      returns: 'Promise',
      args: [ { class: 'String', name: 'id' } ],
      code: function(id) {
        return this.load_(id, []);
      }
    },
    {
      name: 'maybeLoad',
      returns: 'Promise',
      documentation: "Like load, but don't throw if not found.",
      args: [ { name: 'id', of: 'String' } ],
      code: function(id) {
        return this.load(id).catch(function() { return null; });
      }
    },
    {
      name: 'maybeLoad_',
      returns: 'Promise',
      args: [ { name: 'id', of: 'String' },
              { name: 'path', of: 'Array' } ],
      code: function(id, path) {
        return this.load_(id, path).catch(function() { return null; });
      }
    },
    {
      name: 'latch',
      returns: 'Promise',
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
      returns: 'Promise',
      args: [ { class: 'String', name: 'id' },
              { class: 'StringArray', name: 'path' } ],
      code: function(id, path) {
        var self = this;

        if ( foam.String.isInstance(id) ) {
          // Prevent infinite loops, if we're loading this class as a
          // dependency to something that this class depends upon then
          // we can just resolve right away.
          for ( var i = 0 ; i < path.length ; i++ ) {
            if ( path[i].id === id ) return Promise.resolve();
          }

          if ( this.pending[id] ) return this.pending[id];

          // Latched models come from when someone defines a class
          // with foam.CLASS during regular execution (like a script
          // tag).  We hook into those so that they can still use the
          // classloader to ensure any dependencies of that model are
          // loaded before they use it.
          if ( this.latched[id] ) {
            var json = this.latched[id];
            delete this.latched[id];
            return this.pending[id] = Promise.all(foam.json.references(this.__context__, json)).then(function() {
              var cls = json.class ? foam.lookup(json.class) : foam.core.Model;
              return self.modelDeps_(cls.create(json), path);
            }).then(function() {
              // Latched models will already be registered in the
              // context via foam.CLASS as defined in EndBoot.js
              return foam.lookup(id);
            });
          }

          if ( foam.lookup(id, true) ) return Promise.resolve(foam.lookup(id));

          return this.pending[id] = this.modelDAO.find(id).then(function(m) {
            if ( ! m ) return Promise.reject(new Error('Model Not Found: ' + id));
            if ( self.Relationship.isInstance(m) ) {
              return m.initRelationship();
            }

            return this.buildClass_(m, path);
          }.bind(this), function() {
            throw new Error("Failed to load class " + id);
          });
        }

        if ( foam.core.Model.isInstance(id) ) {
          return this.pending[id] = this.buildClass_(id, path);
        }

        throw new Error("Invalid parameter to ClassLoader.load_");
      }
    },
    {
      name: 'modelDeps_',
      args: [ { name: 'model', of: 'foam.core.Model' },
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
      args: [ { name: 'model', of: 'foam.core.Model' },
              { name: 'path', of: 'Array' } ],
      code: function(model, path) {
        var self = this;

        path = path.concat(model);

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

          return cls;
        });
      }
    }
  ]
});
