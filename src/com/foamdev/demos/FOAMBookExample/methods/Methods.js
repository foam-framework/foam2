/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Methods
// Properties can define their own getter and setter functions
foam.CLASS({
  name: 'GetterSetter',
  properties: [
    'radius',
    {
      name: 'diameter',
      getter: function() {
        return this.radius * 2;
      },
      setter: function(diameter) {
        this.radius = diameter / 2;
      }
    }
  ]
});
var o = GetterSetter.create();

o.diameter = 10;
console.log("r:", o.radius, "d:", o.diameter); // r: 5 d: 10

console.log(o);

o.radius = 10;
console.log("r:", o.radius, "d:", o.diameter); // r: 10 d: 20


// The preSet function is called on a property update, after adapt
// Properties can specify a 'preSet' function which is called whenever
// the properties' value is updated, just after 'adapt', if present.

// Both the previous value of the property and the proposed new value are
// passed to preSet.  PreSet returns the desired new value, which may be different
// from the newValue it's provided.
foam.CLASS({
  name: 'PreSetTest',
  properties: [
    {
      name: 'a',
      preSet: function(oldValue, newValue) { // just after 'adapt'
        console.log('preSet p1');
        return newValue + "y";
      }
    }
  ]
});
var o1 = PreSetTest.create({
  a: 'Smith'
});
console.log(o1.a); // TODO does this run just after the update.

o1.a = 'Jones';
console.log(o1.a);

// The postSet function is called after a property update
// Properties can specify a 'postSet' function which is called after
// the properties' value is updated.  PostSet has no return value and
// cannot stop the newValue from taking effect, since postSet it is
// called after the value has been set.
var lastPostSetValue;
foam.CLASS({
  name: 'PostSetTest',
  properties: [
    {
      name: 'a',
      postSet: function(oldValue, newValue) {
        console.log('postSet old:', oldValue, "new:", newValue);
        // this.a will match the newValue, since the set is already
        // complete
        lastPostSetValue = this.a;
      }
    }
  ]
});
var o = PostSetTest.create({
  a: 'Smith'
});
o.a = 'Jones';
o.a = 'Green';

// Function memoize1: foam.Function.memoize1() memoizes a one-argument function
// if called again with the same argument, the previously generated
// value will be returned rather than calling the function again.
var calls = 0;
var f = foam.Function.memoize1(function(x) {
  calls += 1;
  console.log('calculating ', x, "=>", x * x);
  return x * x;
});

console.log(f(2));
console.log(f(2)); // print the result
console.log(f(4));
console.log("Total number of calls:", calls); // 2

// Function memoize1 one arg only:A call to memoize1'ed function with no
// arguments or too many arguments will trigger a failed assertion
f();     // Assertion failed: Memoize1'ed functions must take exactly one argument.
f(1, 2); // Assertion failed: Memoize1'ed functions must take exactly one argument.

// toBeAssertedThat(function() { f(); }).toThrow();
// toBeAssertedThat(function() { f(1, 2); }).toThrow();

// Function argsStr: foam.Function.argsStr() returns a function\'s arguments as a string
var f = function(a, b, fooBar) {};
var argsAsStr = foam.Function.argsStr(f);
console.log('Function args:', argsAsStr); // Function args: a, b, fooBar
// toBeAssertedThat(argsAsStr).toEqual('a, b, fooBar');
// toBeAssertedThat(foam.String.isInstance(argsAsStr)).toBe(true);


// Function argNames: foam.Function.argNames() returns a function\'s arguments an an array
var f = function(a, b, fooBar) {};
var argsAsArray = foam.Function.argNames(f);
console.log('Function args array:', argsAsArray); // ["a", "b", "fooBar"]

// TODO add example to present the atomic concept