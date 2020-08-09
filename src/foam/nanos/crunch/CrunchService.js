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
    }
  ],
});
