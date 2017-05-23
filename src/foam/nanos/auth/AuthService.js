/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'AuthService',
  // javaImports: ['foam.core.X', 'javax.security.auth.login.LoginException'],
  methods: [
    {
      name: 'generateChallenge',
      javaReturns: 'String',
      args: [
        {
          name: 'username',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'challengedLogin',
      javaReturns: 'void',
      javaThrows: [ 'javax.security.auth.login.LoginException' ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'response',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'login',
      javaReturns: 'Boolean',
      args: [
        {
          name: 'username',
          javaType: 'String'
        },
        {
          name: 'password',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'logout',
      javaReturns: 'void',
      args: [
        {
          name: 'username',
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
          name: 'principal',
          javaType: 'java.security.Principal'
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
      javaThrows: [ 'IllegalStateException' ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'principal',
          javaType: 'java.security.Principal'
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
      name: 'validatePrincipal',
      javaReturns: 'void',
      javaThrows: [ 'IllegalStateException' ],
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldValue',
          javaType: 'java.security.Principal'
        },
        {
          name: 'newValue',
          javaType: 'java.security.Principal'
        }
      ]
    }
  ]
});
