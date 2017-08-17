/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'WebAuthService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'generateChallenge',
      javaReturns: 'String',
      returns: 'Promise',
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
      returns: 'Promise',
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
      returns: 'Promise',
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
      returns: 'Promise',
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
      returns: 'Promise',
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
      returns: 'Promise',
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
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'String'
        }
      ]
    }
  ]
});
