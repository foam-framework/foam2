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
  name: 'Implements',

  documentation: function() {/*
    Axiom for declaring intent to implement an interface.

    Since interfaces can also have implementations, it
    can also be used to provide mix-ins, which is a safe form of
    multiple-inheritance.
  <pre>
    Ex.
    foam.CLASS({
      name: 'SalaryI',
      properties: [ 'salary' ]
    });

    foam.CLASS({
      name: 'Employee',
      extends: 'Person',
      implements: [ 'SalaryI' ]
    });
  </pre>
  Employee extends Person through regular inheritance, but
  the axioms from SalaryI are also added to the class.
  Any number of mix-ins/interfaces can be specified.
  */},

  properties: [
    {
      name: 'name',
      getter: function() { return 'implements_' + this.path; }
    },
    'path'
  ],

  methods: [
    function installInClass(cls) {
      var m = this.lookup(this.path);
      if ( ! m ) throw 'No such interface or trait: ' + this.path;

      // TODO: clone these axioms since they could be reused and then would
      // have the wrong sourceCls_;

      // This next part is a bit tricky.
      // If we install a mixin and then override properties of one of the
      // Properties from the mixin, the mixin Property will see the overridden
      // Property as its super-prop, which is wrong. So, we insert a new level
      // in the axiomMap_ between the current axiomMap_ and its prototype, and
      // then install the mixin there.

      // Current AxiomMap
      var aMap = cls.axiomMap_;

      // New mixin AxiomMap to install into
      var sMap = Object.create(aMap.__proto__);

      // Insert new AxiomMap between current and its parent
      aMap.__proto__ = sMap;

      // Temporarily set the class'es AxiomMap to sMap so that
      // mixin axioms get installed into it.
      cls.axiomMap_ = sMap;

      cls.installAxioms(m.getOwnAxioms());

      // Put the original AxiomMap back, with the inserted parent.
      cls.axiomMap_ = aMap;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  package: 'foam.core',
  name: 'ImplementsModelRefine',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Implements',
      name: 'implements',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Implements.create({path: o}) :
          foam.core.Implements.create(o)         ;
      }
    }
  ]
});
