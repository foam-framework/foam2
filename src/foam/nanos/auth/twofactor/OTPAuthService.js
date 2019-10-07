/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth.twofactor',
  name: 'OTPAuthService',

  documentation: 'One-time password auth service',

  methods: [
    {
      name: 'generateKeyAndQR',
      async: true,
      type: 'foam.nanos.auth.twofactor.OTPKey',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'verifyToken',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'token',
          type: 'String'
        }
      ]
    },
    {
      name: 'disable',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'token',
          type: 'String'
        }
      ]
    }
  ]
});
