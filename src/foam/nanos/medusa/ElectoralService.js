foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'ElectoralService',

  methods: [
    {
      name: 'getState',
      type: 'foam.nanos.medusa.ElectoralServiceState'
    },
    {
      name: 'dissolve'
    },
    {
      name: 'vote',
      type: 'Long',
      args: [
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'time',
          type: 'Long'
        }
      ]
    },
    {
      name: 'report',
      args: [
        {
          name: 'winner',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ]
    }
  ]
});
