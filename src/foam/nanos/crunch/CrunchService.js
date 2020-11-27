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

  javaImports: [
    'foam.nanos.crunch.lite.CapablePayload'
  ],

  topics: [
    'updateJunction'
  ],

  methods: [
    {
      name: 'getPrereqs',
      type: 'java.util.List<String>',
      args: [
        { name: 'capId', type: 'String' }
      ],
      flags: ['java']
    },
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
      name: 'getDependantIds',
      type: 'String[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
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
          name: 'data',
          type: 'foam.core.FObject'
        },
        {
          name: 'status',
          type: 'foam.nanos.crunch.CapabilityJunctionStatus'
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
    },
    {
      name: 'maybeReopen',
      documentation: `
        Checks if a capability can be reopened from the appstore by checking if its :
          - non-PENDING
          - non-GRANTED or renewable
      `,
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'capabilityId',
          type: 'String'
        }
      ]
    },
    {
      name: 'isRenewable',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'capabilityId',
          type: 'String'
        }
      ]
    },
    {
      name: 'hasPreconditionsMet',
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        }
      ]
    },
    {
      name: 'getCapableObjectPayloads',
      async: true,
      type: 'CapablePayload[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'capabilityIds',
          type: 'String[]'
        },
      ]
    },
    {
      name: 'getAllJunctionsForUser',
      async: true,
      type: 'UserCapabilityJunction[]',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
