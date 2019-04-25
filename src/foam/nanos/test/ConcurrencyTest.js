/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.test',
  name: 'ConcurrencyTest',

  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    {
      name: 'setup',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      documentation: 'return result of test.',
      name: 'result',
      type: 'String'
    }
  ]
});
