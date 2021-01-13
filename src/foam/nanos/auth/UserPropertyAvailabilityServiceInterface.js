/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'UserPropertyAvailabilityServiceInterface',

  methods: [
    {
      name: 'checkAvailability',
      documentation: `
        Checks whether a user that has targetProperty set to value already exists.
        Restricted use for Email and Username.
      `,
      async: true,
      javaThrows: ['AuthorizationException'],
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'targetProperty',
          type: 'String'
        },
        {
          name: 'value',
          type: 'String'
        }
      ]
    }
  ]
});
