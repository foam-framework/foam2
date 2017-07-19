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
      javaReturns: 'String',
      args: [
        {
          name: 'userId',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'challengedLogin',
      javaReturns: 'void',
      args: [
        {
          name: 'userId',
          javaType: 'String'
        },
        {
          name: 'challenge',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'login',
      javaReturns: 'void',
      args: [
        {
          name: 'userId',
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
          name: 'userId',
          javaType: 'String'
        },
        {
          name: 'permission',
          javaType: 'java.security.Permission'
        }
      ]
    },
    {
      name: 'updatePassword',
      javaReturns: 'void',
      args: [
        {
          name: 'userId',
          javaType: 'String'
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
      javaReturns: 'Boolean',
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
          name: 'userId',
          javaType: 'String'
        }
      ]
    }
  ]
});
