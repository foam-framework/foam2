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
    },
    {
      name: 'transferValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'transferValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      returns: 'Promise',
      args: [
        {
          name: 'email',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'requestValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'requestValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      returns: 'Promise',
      args: [
        {
          name: 'email',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'getTransactions',
      javaReturns: 'foam.dao.DAO',
      javaThrows: [ 'java.lang.RuntimeException' ],
      returns: 'Promise',
    },
  ]
});
