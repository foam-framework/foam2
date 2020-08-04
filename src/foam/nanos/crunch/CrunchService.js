foam.INTERFACE({
  package: 'foam.nanos.crunch',
  name: 'CrunchService',

  methods: [
    {
      name: 'getGrantPath',
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
    }
  ],
});
