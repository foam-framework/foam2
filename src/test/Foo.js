foam.CLASS({
  package: 'test',
  name: 'Foo',
  requires: [
    'test.Bar'
  ],
  properties: [
    {
      name: 'foo',
      value: 12
    }
  ],
  methods: [
    function init() {
    },
    function method() {
      console.log("Foo.bar", this.Bar.create().bar);
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
      name: 'bar',
      value: 32
    }
  ],
  methods: [
    function init() {
    },
    function method() {
      console.log("Bar.foo", this.Foo.create().foo);
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
      factory: function() {
        return this.of.CONSTANT;
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
  name: 'FooRefinement',
  require: [
  ],
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
