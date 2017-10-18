/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'WebAuthService',

  methods: [
    {
      name: 'generateChallenge',
      returns: 'Promise',
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
      returns: 'Promise',
      javaReturns: 'foam.nanos.auth.User',
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
      returns: 'Promise',
      javaReturns: 'foam.nanos.auth.User',
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
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'long'
        },
        {
          name: 'permission',
          javaType: 'foam.nanos.auth.Permission'
        }
      ]
    },
    {
      name: 'updatePassword',
      returns: 'Promise',
      javaReturns: 'void',
      javaThrows: [ 'javax.naming.AuthenticationException' ],
      args: [
        {
          name: 'userId',
          javaType: 'long'
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
      name: 'logout',
      javaReturns: 'void',
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'long'
        }
      ]
    }
  ]
});
