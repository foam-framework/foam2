/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'RetryStrategy',

  properties: [
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinite retry.'
    },
    {
      class: 'Int',
      name: 'maxRetryDelay'
    },
    {
      name: 'whilePredicate',
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate'
    }
  ],

  methods: [
    {
      name: 'retry',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO',
        },
        {
          documentation: 'DAO operation: put, cmd.',
          name: 'op',
          type: 'String',
          value: 'put'
        },
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      type: 'Object',
      javaThrows: [
        'foam.dao.RetryException',
        'java.lang.RuntimeException'
      ],
    }
  ]
});
