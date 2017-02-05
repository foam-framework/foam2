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
  package: 'foam.core',
  name: 'ModelARequireExtension',
  refines: 'foam.core.Model',

  methods: [
    function arequire() {
      var X = this.__subContext__;
      var promises = [];
      if ( this.extends ) promises.push(X.arequire(this.extends));
      for (var i = 0, a; a = this.axioms_[i]; i++) {
        if ( a.arequire ) promises.push(a.arequire());
      }
      return Promise.all(promises);
    },
  ],
});

foam.CLASS({
  package: 'foam.core',
  name: 'RequiresARequireExtension',
  refines: 'foam.core.Requires',

  methods: [
    function arequire() {
      return this.__subContext__.arequire(this.path);
    },
  ],
});

foam.CLASS({
  package: 'foam.core',
  name: 'ClassLoader',

  exports: [
    'arequire',
  ],

  properties: [
    {
      name: 'pending',
      class: 'Object',
      factory: function() {
        return {};
      },
    },
  ],

  methods: [
    {
      name: 'arequire',
      class: 'foam.core.ContextMethod',
      code: function(X, modelId) {
        if (X.isRegistered(modelId)) return Promise.resolve();
        if (this.pending[modelId]) return this.pending[modelId];

        var modelDao = X[foam.String.daoize(foam.core.Model.name)];
        this.pending[modelId] = modelDao.find(modelId).then(function(m) {
          m.validate();
          if (X.isRegistered(modelId)) return m;
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
          foam.__context__.registerFactory(m, f);
          foam.package.registerClassFactory(m, f);
          return m;
        }).then(function(m) {
          return m.arequire();
        });

        var self = this;
        this.pending[modelId].then(function() {
          delete self.pending[modelId];
        });

        return this.pending[modelId];
      },
    },
  ]
});

foam.__context__ = foam.core.ClassLoader.create(
  {},
  foam.__context__
).__subContext__;
