/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({ // class definition
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

// Create an instance of Test
var o = Test.create();
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b); // undefined

// Create an instance with a map argument to initialize properties
var o = Test.create({
  a: 3,
  b: 'hello'
});
console.log("Class: ", o);
console.log('a: ' + o.a + ', b: ' + o.b); // 3 'hello'

// If a Class defineds an init() method, it's called when an object is created
foam.CLASS({
  name: 'InitTest',
  properties: [ 'a' ],
  methods: [ function init() {
    this.a = 'just born!';
  } ]
});
var o = InitTest.create();
console.log("Initialized value:", o.a); // 'just born!'

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
console.log("Values:", o.a, o.b, o.c); // 42 foo undefined