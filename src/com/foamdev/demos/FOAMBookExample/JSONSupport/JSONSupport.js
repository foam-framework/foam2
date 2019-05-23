/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// JSON support
// Create JSON Class :Conversion to and from JSON is supported
foam.CLASS({
  name: 'JSONTest',
  properties: [
    {
      name: 'name',
      shortName: 'n'
    },
    {
      class: 'Int',
      name: 'age',
      shortName: 'a'
    },
    {
      class: 'StringArray',
      name: 'children',
      shortName: 'cs'
    },
    {
      name: 'name That Needs Quoting'
    },
    {
      name: 'undefined'
    },
    {
      name: 'defined'
    },
    {
      class: 'String',
      name: 'undefinedString'
    },
    {
      class: 'String',
      name: 'definedString'
    },
    {
      class: 'String',
      name: 'defaultString',
      value: 'default'
    },
    {
      class: 'Int',
      name: 'undefinedInt'
    },
    {
      class: 'Int',
      name: 'definedInt'
    },
    {
      class: 'Int',
      name: 'defaultInt',
      value: 3
    },
    {
      class: 'Float',
      name: 'undefinedFloat'
    },
    {
      class: 'Float',
      name: 'definedFloat'
    },
    {
      class: 'Float',
      name: 'defaultFloat',
      value: 3.14
    },
    {
      class: 'Boolean',
      name: 'undefinedBoolean'
    },
    {
      class: 'Boolean',
      name: 'trueBoolean'
    },
    {
      class: 'Boolean',
      name: 'falseBoolean'
    },
    {
      class: 'Boolean',
      name: 'defaultBoolean',
      value: true
    },
    {
      class: 'Function',
      name: 'undefinedFunction'
    },
    {
      class: 'Function',
      name: 'definedFunction'
    },
    {
      name: 'undefinedFObject'
    },
    {
      name: 'definedFObject'
    },
    {
      name: 'transient',
      transient: true
    },
    {
      name: 'networkTransient',
      networkTransient: true
    },
    {
      name: 'storageTransient',
      storageTransient: true
    },
  //    { name: '' },
  ]
});


// JSON parse: Use foam.json.parse(someJSONobject) to convert to an FObject
var o = foam.json.parse({
  class: 'JSONTest',
  name: 'John',
  age: 42,
  children: [ 'Peter', 'Paul' ]
});
o.describe();


// JSON output: Use foam.json.stringify(fobject) to serialize an FObject to a
// JSON string
o = JSONTest.create({
  name: 'John',
  age: 42,
  children: [ 'Peter', 'Paul' ],
  "name That Needs Quoting": 42,
  defined: 'value',
  definedString: 'stringValue',
  definedInt: 42,
  defaultInt: 3,
  definedFloat: 42.42,
  defaultFloat: 3.14,
  trueBoolean: true,
  falseBoolean: false,
  defaultBoolean: true,
  definedFunction: function plus(a, b) {
    return a + b;
  },
  definedFObject: JSONTest.create({
    name: 'Janet',
    age: 32,
    children: [ 'Kim', 'Kathy' ]
  }),
  transient: 'transient value',
  networkTransient: 'network transient value',
  storageTransient: 'storage transient value'
});
// Default JSON formatting
console.log(foam.json.stringify(o));


// JSON output modes: Different outputters support suppressing properties,
// transients, and other options

// Outputters have different defaults for formatting, which properties
// to output, etc. You can clone one and change these settings on the
// outputter to customize your JSON output.

console.log('\nConvert to a JSON object (instead of a String):');
console.log(foam.json.stringify(JSONTest.create(foam.json.objectify(o))));

console.log('\nAs a method on Objects:');
// console.log(o.stringify()); // TODO error

console.log('\nPretty-printed output:');
console.log(foam.json.Pretty.stringify(o));

console.log('\nDisable class name output by cloning your own outputter:');
console.log(foam.json.Pretty.clone().copyFrom({
  outputClassNames: false
}).stringify(o));

console.log('\nStrict output:');
console.log(foam.json.Strict.stringify(o));

console.log('\nStrict-but-still-readable output:');
console.log(foam.json.PrettyStrict.stringify(o));

console.log('\nCompact output:');
console.log(foam.json.Compact.stringify(o));

console.log('\nShort-name (very compact) output:');
console.log(foam.json.Short.stringify(o));

console.log('\nNetwork (network-transient properties omitted) output:');
console.log(foam.json.Network.stringify(o));

console.log('\nStorage (storage-transient properties omitted) output:');
console.log(foam.json.Storage.stringify(o));

// toBeAssertedThat(foam.json.Network.stringify(o).indexOf('networkTransient').toEqual(-1);
// toBeAssertedThat(foam.json.Storage.stringify(o).indexOf('storageTransient').toEqual(-1);