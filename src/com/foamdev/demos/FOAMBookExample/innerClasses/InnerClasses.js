/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Inner Classes: Inner classes are defined inside another class, not directly available in the global namespace.
// Classes can have inner-Classes.
var results = '';
foam.CLASS({
  name: 'InnerClassTest',
  classes: [
    {
      name: 'InnerClass1',
      properties: [ 'a', 'b' ]
    },
    {
      name: 'InnerClass2',
      properties: [ 'x', 'y' ]
    }
  ],
  methods: [
    function init() {
      // access from within the outer class
      var ic1 = this.InnerClass1.create({
        a: 1,
        b: 2
      });
      var ic2 = this.InnerClass2.create({
        x: 5,
        y: 10
      });
      results += ic1.a + ", " + ic1.b + ", " + ic2.x + ", " + ic2.y;
    }
  ]
});

InnerClassTest.create();
console.log(results); // 1, 2, 5, 10

// Inner Class access: Inner classes are only accessible through their outer class
console.log("Access through outer:", InnerClassTest.InnerClass1.name);

// Inner-classes do not appear in the global namespace
console.log("Available globally?", !! global.InnerClass1);

// Inner Enums: Similar to Inner-classes, there's also Inner-enums
var result = '';
foam.CLASS({
  name: 'InnerEnumTest',
  enums: [
    {
      name: 'InnerEnum',
      values: [
        {
          name: 'OPEN',
          label: 'Open'
        },
        {
          name: 'CLOSED',
          label: 'Closed'
        }
      ]
    }
  ],
  methods: [
    function init() {
      // access from within the outer class
      result += this.InnerEnum.OPEN + " / " + this.InnerEnum.CLOSED;
    }
  ]
});
InnerEnumTest.create();
console.log(result); // OPEN / CLOSED


// Inner Enum access: Inner-enums can only be accessed through the outer-class
console.log("Access through outer:", InnerEnumTest.InnerEnum.name);

// Inner-enums do not appear in the global namespace
console.log("Available globally?", !! global.InnerEnum);