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

  documentation: 'An InterfaceMethod is a Method declaration, but lacks code.',

  properties: [
    {
      name: 'code',
      required: false
    },
    {
      class: 'Boolean',
      name: 'abstract',
      value: true
    }
  ],

  methods: [
    function installInProto() { },
    function installInClass(cls, superMethod, existingMethod) {
      // This is required to avoid inheritance from regular methods,
      // which would prevent methods from being named the same as methods
      // defined on FObject, like: log, warn, error.
      cls.axiomMap_[this.name] = this;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'InterfaceModel',
  extends: 'foam.core.Model',

  documentation: 'An Interface definition. Created with foam.INTERFACE().',

  properties: [
    [ 'extends', 'foam.core.AbstractInterface' ],
    {
      class: 'AxiomArray',
      name: 'methods',
      of: 'foam.core.internal.InterfaceMethod'
    },
    {
      class: 'StringArray',
      name: 'javaExtends'
    }
  ],
  methods: [
    function validate() {
      if ( this.extends !== 'foam.core.AbstractInterface' )
        throw 'INTERFACE: ' + this.id + ' does not extend AbstractInterface.  Did you mean impelments [ \'' + this.extends + '\' ], ?';
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'AbstractInterface',

  documentation: 'Abstract base-class for Interfaces.',

  axioms: [
    {
      installInClass: function(cls) {
        cls.create = function() {
          throw new Error("Cannot instantiate an Interface.");
        };
      }
    }
  ]
});


foam.LIB({
  name: 'foam',

  methods: [
    function INTERFACE(m) {
      m.class = m.class || 'foam.core.InterfaceModel';
      foam.CLASS(m);
    }
  ]
});
