/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AuthService',

  methods: [
    {
      name: 'getCurrentUser',
      async: true,
      returns: 'foam.nanos.auth.User',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'generateChallenge',
      async: true,
      returns: 'String',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          type:  'Long'
        }
      ]
    },
    {
      name: 'challengedLogin',
      async: true,
      returns: 'foam.nanos.auth.User',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'challenge',
          type: 'String'
        }
      ]
    },
    {
      name: 'login',
      async: true,
      returns: 'foam.nanos.auth.User',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'password',
          type: 'String'
        }
      ]
    },
    {
      name: 'loginByEmail',
      async: true,
      returns: 'foam.nanos.auth.User',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'email',
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ]
    },
    {
      name: 'checkUser',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          javaType: 'String',
        }
      ]
    },
    {
      name: 'checkUserPermission',
      javaReturns: 'boolean',
      swiftReturns: 'Bool',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission'
        }
      ]
    },
    {
      name: 'checkPermission',
      async: true,
      returns: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission',
        }
      ]
    },
    {
      name: 'check',
      async: true,
      returns: 'Boolean',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          type: 'String',
        }
      ]
    },
    {
      name: 'updatePassword',
      async: true,
      returns: 'foam.nanos.auth.User',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldPassword',
          type: 'String'
        },
        {
          name: 'newPassword',
          type: 'String'
        }
      ]
    },
    {
      name: 'validateUser',
      async: true,
      returns: 'Void',
      javaThrows: [ 'foam.nanos.auth.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ]
    },
    {
      name: 'logout',
      async: true,
      returns: 'Void',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
