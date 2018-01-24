/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/*
TODO:

-Remove foam.classloader classes
-Remove arequire, or change it to use classloader.load
-Make GENMODEL work when running without a classloader
-


*/

foam.CLASS({
  package: 'foam.apploader',
  name: 'ClassLoader',
  /* todo: [
    `Don't register classes globally, register in a subcontext so we can
have multiple classloaders running alongside eachother`
  ],*/
  imports: [
    'modelDAO'
  ],
  properties: [
    {
      class: 'Map',
      name: 'pending'
    }
  ],
  methods: [
    {
      name: 'load',
      returns: 'Promise',
      args: [ { class: 'String', name: 'id' } ],
      code: function(id) {
        return this.load_(id, []);
      }
    },
    {
      name: 'load_',
      returns: 'Promise',
      args: [ { class: 'String', name: 'id' },
              { class: 'StringArray', name: 'path' } ],
      code: function(id, path) {
        if ( foam.String.isInstance(id) ) {
          // Prevent infinite loops, if we're loading this class as a
          // dependency to something that this class depends upon then
          // we can just resolve right away.
          for ( var i = 0 ; i < path.length ; i++ ) {
            if ( path[i].id === id ) return Promise.resolve();
          }

          if ( this.pending[id] ) return this.pending[id];

          if ( foam.lookup(id, true) ) return Promise.resolve(foam.lookup(id));

          return this.pending[id] = this.modelDAO.find(id).then(function(m) {
            return this.buildClass_(m, path);
          }.bind(this));
        }

        if ( foam.core.Model.isInstance(id) ) {
          return this.pending[id] = this.buildClass_(id, path);
        }

        throw new Error("Invalid parameter to ClassLoader.load_");
      }
    },
    {
      name: 'buildClass_',
      args: [ { name: 'model', of: 'foam.core.Model' },
              { name: 'path', of: 'Array' } ],
      code: function(model, path) {
        var self = this;

        path = path.concat(model);

        var deps = model.requires ?
            model.requires.map(function(r) { return self.load_(r.path, path); }) :
            [];

        deps = deps.concat(model.implements ?
                           model.implements.map((function(i) { return self.load_(i.path, path); })) :
                           []);

        if ( model.extends ) deps.push(self.load_(model.extends, path));

        return Promise.all(deps).then(function() {
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
