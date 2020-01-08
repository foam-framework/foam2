foam.INTERFACE({
  package: 'foam.u2.filter',
  name: 'AccumulatorFilter',
  methods: [
    {
      name: 'fetchDAOContents',
      async: true,
      type: 'java.util.List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        },
        {
          name: 'property',
          type: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
