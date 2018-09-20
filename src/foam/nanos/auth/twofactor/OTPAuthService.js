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
      name: 'generateKey',
      async: true,
      returns: 'String',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'generateQrCode',
          type: 'Boolean'
        }
      ]
    },
    {
      name: 'verifyToken',
      async: true,
      returns: 'Boolean',
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
      returns: 'Boolean',
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
