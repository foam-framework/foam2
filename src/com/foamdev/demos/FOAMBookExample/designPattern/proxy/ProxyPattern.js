/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Proxy (delegate)
foam.CLASS({
  name: 'Abc',
  methods: [
    function foo() {
      console.log("foo");
    }
  ]
});

foam.CLASS({
  name: 'ProxyAbc',
  properties: [
            {
      class: 'Proxy',
      of: 'Abc',
      name: 'delegateAbc'
    }
  ]
});

var a = ProxyAbc.create({ delegateAbc: Abc.create() });
a.foo();// foo

// This is what a forwarded method looks like
/*function foo() {
  this.delegateAbc.foo();
}*/

// If the foo method was delegated, it would look like this:
/*function foo() {
  this.delegateAbc.foo.call(this);
}*/
