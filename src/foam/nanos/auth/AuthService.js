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
      javaReturns: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    },
    {
      name: 'generateChallenge',
      javaReturns: 'String',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'userId',
          javaType: 'long'
        }
      ]
    },
    {
      name: 'challengedLogin',
      javaReturns: 'foam.core.X',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'userId',
          javaType: 'long'
        },
        {
          name: 'challenge',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'login',
      javaReturns: 'foam.core.X',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'userId',
          javaType: 'long'
        },
        {
          name: 'password',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'loginByEmail',
      javaReturns: 'foam.core.X',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'email',
          javaType: 'String'
        },
        {
          name: 'password',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'check',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission'
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
          javaType: 'foam.core.X'
        },
        {
          name: 'oldPassword',
          javaType: 'String'
        },
        {
          name: 'newPassword',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'validateUser',
      javaReturns: 'void',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'user',
          javaType: 'User'
        }
      ]
    },
    {
      name: 'logout',
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
