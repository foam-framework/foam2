/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// String
// String constantize: foam.String.constantize converts strings from camelCase
// to CONSTANT_FORMAT
console.log('foo      =>', foam.String.constantize('foo'));      // FOO
console.log('fooBar   =>', foam.String.constantize('fooBar'));   // FOO_BAR
console.log('fooBar12 =>', foam.String.constantize('fooBar12')); // FOO_BAR12

// String capitalize: foam.String.capitalize capitalizes the first letter of a string
console.log(foam.String.capitalize('Abc def')); // Abc def
console.log(foam.String.capitalize('abc def')); // Abc def

// String labelize: foam.String.labelize converts from camelCase to labels
console.log(foam.String.labelize('camelCase'));    // Camel Case
console.log(foam.String.labelize('firstName'));    // First Name
console.log(foam.String.labelize('someLongName')); // Some Long Name

// String multiline: foam.String.multiline lets you build multi-line strings
// from function comments
console.log(foam.String.multiline(function() {
  /*This is
        a
        multi-line
        string*/
}));

// String pad: foam.String.pad() pads a string to the specified length
var s = foam.String.pad('foobar', 10);
console.log("padded  10:", '"' + s + '"', s.length); // "foobar    "

// pad() is right justifying if given a negative number
var s = foam.String.pad('foobar', - 10);
console.log("padded -10:", '"' + s + '"', s.length); // "    foobar"