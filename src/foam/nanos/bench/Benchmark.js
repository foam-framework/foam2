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
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    }
  ]
});
