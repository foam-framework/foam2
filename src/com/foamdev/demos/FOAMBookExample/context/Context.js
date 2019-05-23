/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Context methods
//Classes can specify a package
foam.CLASS({
  package: 'com.acme',
  name: 'Test',
  methods: [ function foo() {
    console.log('Hello, I am foo() from com.acme.Test');
  } ]
});

// Context create sub context: Contexts can be explicitly created with foam.createSubContext()
// The second argument of createSubContext() is an optional name for the Context
var Y1 = foam.createSubContext({
  key: 'value',
  fn: function() {
    return 'here';
  }
}, 'SubContext');
console.log("Y1:", Y1.key, Y1.fn()); // Y1: value here


// Context context sub context: Sub-Contexts can be created from other Contexts
var Y2 = Y1.createSubContext({
  key: 'value2'
});
console.log("Y2:", Y2.key, Y2.fn()); // Y2: value2 here


// Context sub context describe: A Context's contents can be inspected with .describe()
Y1.describe();
Y2.describe();

// Classes should requires: other Classes they need to use
// Classes can requires: other Classes to avoid having to reference them
// by their fully-qualified names. The creation context (and thus our
// exports) is also automatically provided.
foam.CLASS({
  name: 'RequiresTest',
  requires: [ 'com.acme.Test' ],
  methods: [ function foo() {
    this.Test.create().foo();
  } ]
});

console.log("When required:");
RequiresTest.create().foo();


// Requires can use as to alias required Classes
// Use 'as' to pick the name to use on 'this'. If a required
// class is named the same as one of your properties or methods,
// or two required classes have the same name, you may be forced
// to specify the name with 'as':
foam.CLASS({
  name: 'RequiresAliasTest',
  requires: [ 'com.acme.Test as NotTest' ],
  methods: [ function foo() {
    this.NotTest.create().foo();
  } ]
});

console.log("Required as NotTest:");
RequiresAliasTest.create().foo();