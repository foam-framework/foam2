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
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'getCurrentGroup',
      async: true,
      type: 'foam.nanos.auth.Group',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'login',
      async: true,
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
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
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
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
      name: 'validatePassword',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      swiftThrows: true,
      args: [
        {
          name: 'potentialPassword',
          type: 'String',
        }
      ]
    },
    {
      name: 'checkUser',
      type: 'Boolean',
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ]
    },
    {
      name: 'checkUserPermission',
      type: 'Boolean',
      async: true,
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission'
        }
      ]
    },
    {
      name: 'check',
      async: true,
      type: 'Boolean',
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
      type: 'foam.nanos.auth.User',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
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
      type: 'Void',
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
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
      type: 'Void',
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
