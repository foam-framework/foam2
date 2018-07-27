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
      returns: 'Promise',
      javaReturns: 'String',
      swiftReturns: 'String',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'generateQrCode',
          javaType: 'boolean',
          swiftType: 'Bool'
        }
      ]
    },
    {
      name: 'verifyToken',
      returns: 'Promise',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'token',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    }
  ]
});
