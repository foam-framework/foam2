/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.bench',
  name: 'Benchmark',

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
      name: 'teardown',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'stats',
          type: 'java.util.Map'
        }
      ]
    }
  ]
});
