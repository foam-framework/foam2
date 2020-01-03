foam.INTERFACE({
  package: 'foam.u2.filter',
  name: 'AccumulatorFilter',
  methods: [
    {
      name: 'fetchDAOContents',
      type: 'java.util.List',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        },
        {
          name: 'property',
          type: 'foam.core.PropertyInfo'
        }
      ]
    }
  ]
});
