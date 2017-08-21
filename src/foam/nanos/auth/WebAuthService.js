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
          javaType: 'long'
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
      javaReturns: 'void',
      returns: 'Promise',
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
      javaReturns: 'void',
      returns: 'Promise',
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
