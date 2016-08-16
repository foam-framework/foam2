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
  package: 'foam.core.internal',
  name: 'InterfaceMethod',
  extends: 'foam.core.Method',
  properties: [
    {
      name: 'code',
      required: false
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'Interface',
  properties: [
    {
      class: 'String',
      name: 'package'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'extends'
    },
    {
      class: 'String',
      name: 'id',
      expression: function(package, name) {
        return package + '.' + name;
      }
    },
    {
      class: 'AxiomArray',
      name: 'methods',
      of: 'foam.core.internal.InterfaceMethod'
    },
    {
      class: 'AxiomArray',
      name: 'properties',
      // TODO: Should this be a type of property that defines
      // nothing beyond name and type information?
      of: 'foam.core.Property'
    },
    {
      name: 'axioms_',
      factory: function() { return []; }
    }
  ],
  methods: [
    function getAxiomByName(name) {
      return this.axioms_.filter(function(a) {
        return a.name === name;
      })[0];
    },
    function getAxiomsByClass(cls) {
      return this.axioms_.filter(function(a) {
        return cls.isInstance(a);
      });
    },
    function getOwnAxiomsByClass(cls) {
      return this.getAxiomsByClass(cls);
    },
    function hasOwnAxiom(name) {
      return this.axioms_.some(function(a) { return a.name === name; });
    },
    function isInstance(o) {
      return !! ( o && o.cls_ && o.cls_.getAxiomByName('implements_' + this.id) );
    }
  ]
});


foam.LIB({
  name: 'foam',
  methods: [
    function INTERFACE(m) {
      var model = foam.core.Interface.create(m);
      foam.register(model);
      foam.package.registerClass(model);
    }
  ]
});
