/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Factory Pattern
// Properties can have factory methods which create their initial value when they are first accessed.
var factoryCount = 0;
foam.CLASS({
  name: 'FactoryTest',
  properties: [
    {
      name: 'a',
      factory: function() {
        factoryCount++; return 42;
      } // TODO what is the difference between Factory and init?
    }
  ]
});
var o = FactoryTest.create();

// Factories run once when the property is first accessed
console.log("Before:    factory run count:", factoryCount);      // 0
console.log("Value:", o.a, " factory run count:", factoryCount); // 1
// Factory not called value accessed second time:
console.log("Again:", o.a, " factory run count:", factoryCount); // 1

// Factories do not run if the value is set before being accessed
// Value supplied in create()
o = FactoryTest.create({
  a: 43
});
console.log("Value:", o.a, " factory run count:", factoryCount);

// Value set before first access
o = FactoryTest.create();
o.a = 99;
console.log("Value:", o.a, " factory run count:", factoryCount);

// Factories do not run if the value is set before being accessed
// Value supplied in create()
o = FactoryTest.create({
  a: 44
});
console.log("Value:", o.a, " factory run count:", factoryCount);
// Value set before first access
o = FactoryTest.create();
o.a = 99;
console.log("Value:", o.a, " factory run count:", factoryCount);

// Factory is called again if clearProperty() called
var o = FactoryTest.create();
console.log("Run factory: ", o.a);
console.log(" factory run count:", factoryCount);
o.clearProperty('a');
console.log("Again: ", o.a);
console.log(" factory run count:", factoryCount);