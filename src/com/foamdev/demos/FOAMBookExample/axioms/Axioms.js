/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Axioms

foam.CLASS({ // inner class definition
  name: 'Test',
  properties: [
    // short-form
    'a',
    // long-form
    {
      name: 'b'
    }
  ],
  methods: [
    // short-form
    function f1() {
      return 1;
    },
    // long-form
    {
      name: 'f2',
      code: function() {
        return 2;
      }
    }
  ]
});

// Get an array of all Axioms belonging to a Class by calling getAxioms
Test.getAxioms().forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name);
});

// Find an Axiom for a class using getAxiomByName
var a = Test.getAxiomByName('a');
console.log(a.cls_.name, a.name); // Property a

// Find all Axioms of a particular class using getAxiomsByClass
Test.getAxiomsByClass(foam.core.Method).forEach(function(a) {
  console.log(a.cls_ && a.cls_.name, a.name); // just Methods
});

// Custom Axioms: Specify arbitrary Axioms for a Class with axioms:
// In addition the the built-in Axiom types, you can also
// specify arbitrary Axioms with 'axioms:'.
// This example adds the 'Singleton' axiom to make a class
// implement the Singleton patter (ie. there can only be
// one instance)
foam.CLASS({
  name: 'AxiomTest',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [ function init() {
    console.log('Creating AxiomTest');
  } ]
});

/* AxiomTest.create();
AxiomTest.create();*/
console.log("Same instance?", AxiomTest.create() === AxiomTest.create());


// Custom Axioms inherit: Gain the custom axioms of a Class you extend
foam.CLASS({
  name: 'AxiomSubTest',
  extends: 'AxiomTest',
  methods: [ function init() {
    console.log('Creating AxiomSubTest');
  } ]
});
/* AxiomSubTest.create();
AxiomSubTest.create();*/
console.log("sub is same instance?", AxiomSubTest.create() === AxiomSubTest.create());
console.log("sub same as super?", AxiomSubTest.create() === AxiomTest.create());
// toBeAssertedThat(AxiomSubTest.create()).toBe(AxiomSubTest.create());
// toBeAssertedThat(AxiomSubTest.create()).not.toBe(AxiomTest.create());