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
      documentation: 'Set to -1 to infinite retry.',
      value: 20
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'whilePredicate',
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      view: {
        class: 'foam.u2.view.JSONTextView'
      },
      javaFactory: 'return foam.mlang.MLang.TRUE;'
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
          name: 'op',
          type: 'String',
          value: 'put'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO',
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'Object',
      throws: ['java.lang.RuntimeException']
    }
  ]
});
