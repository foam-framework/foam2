/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'Latch',

  documentation: `
    A Promise which can be used as a Latch.
    Is then()-able.
    ex:
      properties: [
        { name: 'latch', factory: () => return this.Latch.create() },
      ...
      ]

      this.latch.then(...);
      ...
      this.latch.resolve(foo);
  `,

  properties: [ 'promise', 'resolve', 'reject' ],

  methods: [
    function init() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject  = reject;
      });
    },

    function then(resolve, reject) {
      return this.promise.then(resolve, reject);
    }
  ]
});
