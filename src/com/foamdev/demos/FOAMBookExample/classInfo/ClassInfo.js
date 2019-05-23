/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

//***Getting information on FOAM class***
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
// Use class.describe() to learn about the class.
// Axiom Type, Source Class, Name and Source Path
Test.describe(); // work with object.

// Objects have a reference to their class in .cls_
var o = Test.create({
  a: 3,
  b: 'hello'
});
console.log("Class object:", o.cls_); // 'Test'

// 'Call toString on an object'
console.log("toString:", o.toString()); // 'Test'

// Test Class membership with Class.isInstance()
console.log('Test.isInstance(o)?', Test.isInstance(o));          // true
console.log('Test.isInstance("foo")?', Test.isInstance("Test")); // false

// Default Values can be defined for Properties
foam.CLASS({
  name: 'DefaultValueTest',
  properties: [
    {
      name: 'a',
      value: 42
    },
    {
      name: 'b',
      value: 'foo'
    },
    {
      name: 'c'
    }
  ]
});

var o = DefaultValueTest.create();
console.log("Values:", o.a, o.b, o.c);
// TODO The hasOwnProperty() method returns a boolean indicating whether the
// object has the specified property as its own property?
// FObject.hasOwnProperty() tells you if a Property has been set
console.log("Before setting:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c')); // false false false
o.a = 99;
o.c = 'test';
console.log("After setting a, c:", o.hasOwnProperty('a'), o.hasOwnProperty('b'), o.hasOwnProperty('c')); // true false true

// FObject.clearProperty() reverts a value back to its value
console.log("Before clearing:", o.hasOwnProperty('a'), o.a); // true 99
o.clearProperty('a');
console.log("After clearing:", o.hasOwnProperty('a'), o.a); // false 42