/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'test',
  name: 'Foo',
  requires: [
    'test.Bar'
  ],
  properties: [
    {
      name: 'asdf',
      value: 12
    },
    {
      class: 'Reference',
      of: 'test.Person',
      name: 'ref'
    }
  ],
  methods: [
    function method() {
      console.log("Foo.Bar.bar", this.Bar.create().asdf);
    }
  ]
});

foam.CLASS({
  package: 'test',
  name: 'Person',
  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Int',
      name: 'age'
    }
  ],
  methods: [
    function describe() {
      console.log("Hello, my name is: " + this.name + ", and I am " + this.age + " years old.");
    }
  ]
});

foam.CLASS({
  package: 'test',
  name: 'Bar',
  requires: [
    'test.Foo'
  ],
  properties: [
    {
      name: 'asdf',
      value: 32
    }
  ],
  methods: [
    function init() {
    },
    function method() {
      console.log("Bar.Foo.asdf", this.Foo.create().asdf);
    }
  ]
});

foam.CLASS({
  package: 'test',
  name: 'Address',
  requires: [
    'test.DayOfWeek'
  ]
});

foam.ENUM({
  package: 'test',
  name: 'DayOfWeek',
  values: [
    'MONDAY',
    'TUESDAY'
  ]
});

foam.CLASS({
  package: 'test',
  name: 'User',
  requires: [
    'test.Address'
  ],
  properties: [
    {
      class: 'FObjectProperty',
      name: 'address',
      of: 'test.Address'
    }
  ]
});

foam.CLASS({
  package: 'test',
  name: 'SomeSpecialType',
  constants: [
    {
      name: 'CONSTANT',
      value: '"some constant value"'
    }
  ]
});

foam.CLASS({
  package: 'test',
  name: 'SpecialProperty',
  extends: 'String',
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: test.SomeSpecialType
    },
    {
      name: 'value',
      expression: function(of) {
        return of.CONSTANT;
      }
    }
  ]
});

foam.ENUM({
  package: 'test.me',
  name: 'AnEnum',
  values: [
    'NO',
    'YES'
  ]
});

foam.CLASS({
  refines: 'test.Foo',
  package: 'test',
  name: 'FooRefinement',
  methods: [
    function refined_method() {
      console.log("Get refined", this.yeah);
    }
  ],
  properties: [
    {
      class: 'test.SpecialProperty',
      name: 'yeah'
    }
  ]
});
