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
      documentation: `Checks whether a user that satisfies the predicate already exists.`,
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'predicate'
        }
      ]
    }
  ]
});
