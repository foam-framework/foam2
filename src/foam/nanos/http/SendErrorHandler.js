/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.http',
  name: 'SendErrorHandler',

  methods: [
    {
      name: 'sendError',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'status',
          type: 'int'
        },
        {
          name: 'message',
          type: 'String'
        }
      ]
    },
    {
      name: 'redirectToLogin',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
