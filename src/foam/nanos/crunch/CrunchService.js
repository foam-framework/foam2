/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch',
  name: 'CrunchService',
  documentation: `
    CrunchService provides common logic used by the client and other CRUNCH
    services.
  `,

  methods: [
    {
      name: 'getGrantPath',
      documentation: `
        getGrantPath provides an array of capability objects representing
        the list of capabilities required to grant the desired capability.
      `,
      async: true,
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sourceId',
          type: 'String'
        }
      ]
    },
    {
      name: 'getCapabilityPath',
      documentation: `
        getGrantPath provides an array of capability objects representing
        the list of capabilities required to grant the desired capability.
      `,
      async: true,
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sourceId',
          type: 'String'
        },
        {
          name: 'filterGrantedUCJ',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'getMultipleCapabilityPath',
      documentation: `
        getGrantPath provides an array of capability objects representing
        the list of capabilities required to grant the desired capability.
      `,
      async: true,
      type: 'List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityIds',
          type: 'String[]'
        },
        {
          name: 'filterGrantedUCJ',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'getJunction',
      documentation: `
        getJunction provides the correct UserCapabilityJunction based on the
        context provided.
      `,
      async: true,
      type: 'UserCapabilityJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        }
      ],
    },
    {
      name: 'getJunctionForSubject',
      documentation: `
        getJunction provides the correct UserCapabilityJunction based on the
        subject provided.
      `,
      async: true,
      type: 'UserCapabilityJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        },
        {
          name: 'subject',
          type: 'foam.nanos.auth.Subject'
        }
      ],
    },
    {
      name: 'updateJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        },
        {
          name: 'data',
          type: 'foam.core.FObject'
        }
      ],
    },
    {
      name: 'maybeIntercept',
      documentation: `
        Invoke a capability intercept if no capabilities from the list of
        options are granted. The intercept will have the specified
        capabilities options for the user.
      `,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'capabilityId',
          type: 'String[]'
        },
      ]
    }
  ],
});
