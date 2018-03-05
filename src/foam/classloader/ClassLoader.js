/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.classloader',
  name: 'ModelARequireExtension',
  refines: 'foam.core.Model',

  methods: [
    function arequire(opt_deps) {
      var X = this.__context__;
      var promises = [];
      if ( this.extends ) promises.push(X.arequire(this.extends, opt_deps));

      for ( var i = 0, a; a = this.axioms_[i]; i++ ) {
        if ( a.arequire ) promises.push(a.arequire(opt_deps));
      }

      return Promise.all(promises);
    }
  ]
});


foam.CLASS({
  package: 'foam.classloader',
  name: 'RequiresARequireExtension',
  refines: 'foam.core.Requires',

  methods: [
    function arequire(opt_deps) {
      return this.__context__.arequire(this.path, opt_deps);
    }
  ]
});


foam.CLASS({
  package: 'foam.classloader',
  name: 'ClassLoader',

  documentation: 'Asynchronous class loader service. Loads classes dynamically.',

  exports: [
    'arequire'
  ],

  properties: [
    {
      name: 'pending',
      class: 'Object',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      name: 'arequire',
      class: 'foam.core.ContextMethod',
      code: function(X, modelId, opt_deps) {
        // Contains models that depend on the modelId and have already been
        // arequired. Used to avoid circular dependencies from waiting on
        // each other.
        var deps = opt_deps || {};

        if ( X.isRegistered(modelId) ) return Promise.resolve();
        if ( deps[modelId] ) return Promise.resolve();
        if ( this.pending[modelId] ) return this.pending[modelId];
        deps[modelId] = true;

        var modelDao = X.classloader[foam.String.daoize(foam.core.Model.name)];
        this.pending[modelId] = modelDao.find(modelId).then(function(m) {
          // Model validation may make use of deps. Require them first, then
          // validate the model.
          foam.assert(m, 'Cannot find ' + modelId);
          return m.arequire(deps).then(function() {
            m.validate();
            return m;
          });
        }).then(function(m) {
          if ( X.isRegistered(modelId) ) return m;

          if ( m.refines ) {
            foam.CLASS(m);
            return m;
          }

          m.id = m.package ? m.package + '.' + m.name : m.name;
          foam.UNUSED[m.id] = true;

          var f = foam.Function.memoize0(function() {
            delete foam.UNUSED[m.id];
            var c = m.buildClass();
            c.validate();
            foam.USED[m.id] = c;
            return c;
          });

          // Register model in global context and global namespace.
          foam.__context__.registerFactory(m, f);
          foam.package.registerClassFactory(m, f);
          return m;
        });

        var self = this;
        this.pending[modelId].then(function() {
          delete self.pending[modelId];
        });

        return this.pending[modelId];
      }
    }
  ]
});

// Export ClassLoader.arequire by overwriting global context with
// ClassLoader's sub-context.
foam.__context__ = foam.classloader.ClassLoader.create(
  {},
  foam.__context__
).__subContext__;
