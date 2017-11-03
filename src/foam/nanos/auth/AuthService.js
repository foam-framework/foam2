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
      name: 'generateChallenge',
      javaReturns: 'String',
      swiftReturns: 'String',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        }
      ]
    },
    {
      name: 'challengedLogin',
      javaReturns: 'foam.core.X',
      swiftReturns: 'Context',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'challenge',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    },
    {
      name: 'login',
      javaReturns: 'foam.core.X',
      swiftReturns: 'Context',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'password',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    },
    {
      name: 'loginByEmail',
      javaReturns: 'foam.core.X',
      swiftReturns: 'Context',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'email',
          javaType: 'String',
          swiftType: 'String'
        },
        {
          name: 'password',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    },
    {
      name: 'check',
      javaReturns: 'Boolean',
      swiftReturns: 'Bool',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission',
        }
      ]
    },
    {
      name: 'updatePassword',
      javaReturns: 'foam.core.X',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        },
        {
          name: 'oldPassword',
          javaType: 'String',
          swiftType: 'String'
        },
        {
          name: 'newPassword',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    },
    {
      name: 'validateUser',
      javaReturns: 'void',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'User',
          swiftType: 'User'
        }
      ]
    },
    {
      name: 'logout',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'Context'
        }
      ]
    }
  ]
});
