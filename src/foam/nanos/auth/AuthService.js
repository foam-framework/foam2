/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AuthService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'generateChallenge',
      javaReturns: 'String',
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
      javaThrows: [ 'java.lang.RuntimeException' ],
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
      javaThrows: [ 'java.lang.RuntimeException' ],
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
      javaThrows: [ 'java.lang.RuntimeException' ],
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
      javaThrows: [ 'java.lang.RuntimeException' ],
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
