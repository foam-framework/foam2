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
    'foam.dao.ArraySink',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.ui.WizardState'
  ],

  topics: [
    'updateJunction'
  ],

  methods: [
    {
      name: 'getPrereqs',
      type: 'java.util.List<String>',
      args: [
        { name: 'x',     type: 'Context' },
        { name: 'capId', type: 'String' },
        { name: 'ucj',   type: 'foam.nanos.crunch.UserCapabilityJunction' }
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
      name: 'getCapabilityPathFor',
      documentation: `
        Returns the capability path with the requested subject set in the context.
        Requires permission to overwrite context's subject, otherwise returns
        capability path with default context.
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
        },
        {
          name: 'effectiveUser',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
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
      name: 'getDependentIds',
      async: true,
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
      ],
      flags: ['java']
    },
    {
      name: 'getJunctionFor',
      documentation: `
        Returns the junction with the requested subject set in the context.
        Requires permission to overwrite context's subject, otherwise returns
        junction with default context.
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
          name: 'effectiveUser',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        }
      ],
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
      name: 'atLeastOneInCategory',
      documentation: `
        Returns true if the user has a capability in a category.
      `,
      async: true,
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'categoryName',
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
      name: 'updateUserJunction',
      async: true,
      type: 'UserCapabilityJunction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'subject',
          type: 'foam.nanos.auth.Subject'
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
      name: 'updateJunctionFor',
      documentation: `
        Updates junction with the requested subject set in the context.
        Requires permission to overwrite context's subject, otherwise updates
        junction with default context.
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
          name: 'data',
          type: 'foam.core.FObject'
        },
        {
          name: 'status',
          type: 'foam.nanos.crunch.CapabilityJunctionStatus'
        },
        {
          name: 'effectiveUser',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
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
          name: 'sessionX',
          type: 'Context'
        },
        {
          name: 'capabilityId',
          type: 'String'
        }
      ],
      documentation: `
        Check if preconditions are met for capabilityId with respect
        to the subject of sessionX.

        Preconditions are defined by setting precondition=true on a
        capability junction. This method will return true only if all
        prerequisites marked as preconditions are satisfied by the
        provided subject.
      `
    },
    {
      name: 'getEntryCapabilities',
      async: true,
      type: 'ArraySink',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      documentation: `
        Query capabilities to be presented in the capability store.

        A capability is an "entry capability" if its visibilityPredicate
        evaluates true and it has all preconditions met. This is the
        case when a capability appears in the Capability Store.
      `
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
    },
    {
      name: 'getWizardState',
      async: true,
      type: 'WizardState',
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
    }
  ]
});
