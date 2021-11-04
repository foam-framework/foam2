/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Interface
// isSubClass() works for interfaces
foam.CLASS({ // TODO foam.INTERFACE ????
  package: 'test',
  name: 'ThingI',
  methods: [ function foo() {
    console.log('Called ThingI.foo()');
  }]
});
foam.CLASS({
  package: 'test',
  name: 'C1',
  implements: [ 'test.ThingI' ]
});
console.log("Is C1 a ThingI?", test.ThingI.isSubClass(test.C1)); // true

// isSubClass() works for sub-interfaces
foam.CLASS({
  package: 'test',
  name: 'Thing2I',
  implements: [ 'test.ThingI' ]
});
foam.CLASS({
  package: 'test',
  name: 'Thing3I',
  implements: [ 'test.ThingI' ]
});
foam.CLASS({
  package: 'test',
  name: 'C2',
  implements: [ 'test.Thing2I' ]
});
var o = test.C2.create();
o.foo();

console.log("Is C2 a ThingI?", test.ThingI.isSubClass(test.C2));   // true
console.log("Is C2 a Thing2I?", test.Thing2I.isSubClass(test.C2)); // true
console.log("Is C2 a Thing3I?", test.Thing3I.isSubClass(test.C2)); // false

//isInstance() works for sub-interfaces
console.log("Is o a ThingI?", test.ThingI.isInstance(o));   // true
console.log("Is o a Thing2I?", test.Thing2I.isInstance(o)); // true
console.log("Is o a Thing3I?", test.Thing3I.isInstance(o)); // false
console.log("Is o a C2?", test.C2.isInstance(o));           //true


// Interface inheritance: Interfaces copy Axioms from another class
// In addition to class-inheritance, FOAM also supports
// interfaces, which are a form of multiple-inheritance which
// copy Axioms from another model.
var callOrder = '';
foam.CLASS({
  name: 'SampleI',
  properties: [ 't1', 't2', 't3' ],
  methods: [
    function tfoo() {
      console.log('ffoo');
      callOrder += 'tfoo';
    },
    function tbar() {
      console.log('tbar');
      callOrder += 'tbar';
    }
  ]
});
foam.CLASS({
  name: 'ImplementsTest',
  implements: [ 'SampleI' ],
  properties: [ 'p1', 'p2', 'p3' ],
  methods: [
    function foo() {
      console.log('foo');
      callOrder += 'foo';
    },
    function bar() {
      console.log('bar');
      callOrder += 'bar';
    }
  ]
});
var tt = ImplementsTest.create({
  p1: 1,
  t1: 2
});
tt.tfoo(); // From SampleI
tt.foo();
console.log("Properties p1:", tt.p1, "t1:", tt.t1);


// Interface multiple inheritance: Implements allows multiple inheritance,
// unlike extends
// Unlike regular inheritance with extends:, classes
// can implement: from multiple sources. However,
// implements only takes axioms from the class you reference,
// not anything it extends or implements.
foam.CLASS({
  name: 'Sample2I',
  properties: [ 'tb1', 'tb2', 'tb3' ],
  methods: [
    function tbfoo() {
      console.log('ffoo');
    },
    function tbbar() {
      console.log('tbar');
    }
  ]
});
foam.CLASS({
  name: 'ImplementsTest2',
  implements: [ 'SampleI', 'Sample2I' ]
});

console.log("ImplementsTest2 properties:",
  ImplementsTest2.getAxiomsByClass(foam.core.Property));