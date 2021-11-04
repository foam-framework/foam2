/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Properties
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

// Properties are defined on the class as constants
// TODO ??? more details
console.log("Method CODE property constant:", foam.core.Method.CODE);
foam.core.Method.CODE.describe(); // toBeAssertedThat(foam.core.Method.CODE.name).toEqual("code");

// Property constants contain map functions
// foam.core.Method.NAME.f(obj) returns obj.name
console.log("Method names in Test:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .map(foam.core.Method.NAME.f)
    .join(', '));

// f in foam.core.Properties            
// Property constants contain comparators
// foam.core.Method.NAME.compare is a compare function
// that properly compares values of NAME.
console.log("Method names in Test, sorted:",
  Test
    .getAxiomsByClass(foam.core.Method)
    .sort(foam.core.Method.NAME.compare)
    .map(foam.core.Method.NAME.f)
    .join(', ')); //.join()