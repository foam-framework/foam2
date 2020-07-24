/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth.username',
  name: 'UsernameServiceInterface',

  documentation: `
    A service for username authorization operations.
  `,

  methods: [
    {
      name: 'checkAvailability',
      documentation: `Checks whether the given username is already assigned to a user in the system.`,
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'username',
          type: 'String'
        }
      ]
    }
  ]
});
