/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'Authorizable',

  documentation: `
    A model should implement this interface if it is authorizable, meaning some
    users are allowed to operate on (create, read, update, or delete) that
    object but others are not.
  `,

  methods: [
    {
      name: 'authorizeOnCreate',
      javaType: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaThrows: ['AuthorizationException'],
    },
    {
      name: 'authorizeOnRead',
      javaType: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaThrows: ['AuthorizationException'],
    },
    {
      name: 'authorizeOnUpdate',
      javaType: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldObj', javaType: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
    },
    {
      name: 'authorizeOnDelete',
      javaType: 'void',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaThrows: ['AuthorizationException'],
    }
  ]
});
