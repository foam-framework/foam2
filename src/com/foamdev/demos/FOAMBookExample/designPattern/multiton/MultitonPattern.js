/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Mutliton: Add the Multion axiom to implement the Multiton pattern
// Multitons create one shared instance per value, based on the given
// property.
foam.CLASS({
  name: 'Color',
  axioms: [ foam.pattern.Multiton.create({
    property: 'color'
  }) ],
  properties: [ 'color' ],
  methods: [ function init() {
    console.log('Creating Color:', this.color);
  } ]
});

var red1 = Color.create({
  color: 'red'
});
var red2 = Color.create({
  color: 'red'
});
var blue = Color.create({
  color: 'blue'
});

console.log('reds same?', red1 === red2);        // true
console.log('red same as blue?', red1 === blue); // false
// toBeAssertedThat(red1).toBe(red2);
// toBeAssertedThat(red1).not.toBe(blue);