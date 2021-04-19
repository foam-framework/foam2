/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Fluent',
  documentation: `
    A domain-specific "language" - a model with chainable methods for
    constructing domain-specific objects, similar to using the builder pattern.

    For creating "fluent" interfaces. See: https://en.wikipedia.org/wiki/Fluent_interface
  `,

  methods: [
    function add() {
      throw new Error('This DSL cannot ".add()"');
    },

    function call(f, args) {
      f.apply(this, args);

      return this;
    },

    function callOn(obj, f, args) {
      obj[f].apply(obj, [this].concat(args));
      return this;
    },

    function callIf(bool, f, args) {
      if ( bool ) f.apply(this, args);

      return this;
    },

    function callIfElse(bool, iff, elsef, args) {
      (bool ? iff : elsef).apply(this, args);

      return this;
    },

    /**
     * Call the given function on each element in the array. In the function,
     * `this` will refer to the element.
     * @param {Array} array An array to loop over.
     * @param {Function} fn A function to call for each item in the given array.
     */
    function forEach(array, fn) {
      if ( foam.core.Slot.isInstance(array) ) {
        this.add(array.map(a => this.E().forEach(a, fn)));
      } else {
        array.forEach(fn.bind(this));
      }
      return this;
    }
  ]
});
