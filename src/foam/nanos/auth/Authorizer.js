/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'Authorizer',

  documentation: `An authorizer is a class that can check if a user has
access to an FObject under different circumstances.`,

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
      ],
      javaThrows: [
        'foam.nanos.auth.AuthorizationException'
      ]
    },
    {
      name: 'authorizeOnRead',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
      ],
      javaThrows: [
        'foam.nanos.auth.AuthorizationException'
      ]
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        },
        {
          name: 'newObj',
          type: 'foam.core.FObject'
        },
      ],
      javaThrows: [
        'foam.nanos.auth.AuthorizationException'
      ]
    },
    {
      name: 'authorizeOnDelete',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
      ],
      javaThrows: [
        'foam.nanos.auth.AuthorizationException'
      ]
    },
    {
      name: 'checkGlobalRead',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
      ],
      javaType: 'boolean'
    },
    {
      name: 'checkGlobalRemove',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
      ],
      javaType: 'boolean'
    },
    {
      name: 'getPermissionPrefix',
      javaType: 'String'
    }
  ]
});
