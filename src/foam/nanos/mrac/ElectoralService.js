foam.INTERFACE({
  package: 'foam.nanos.mrac',
  name: 'ElectoralService',
  javaImports: [
    'java.util.List'
  ],

  methods: [
    {
      name: 'dissolve'
    },
    {
      name: 'vote',
      type: 'Integer',
      args: [
        {
          name: 'time',
          type: 'Date'
        }
      ]
    },
    {
      name: 'report',
      args: [
        {
          name: 'winner',
          type: 'foam.nanos.mrac.ClusterConfig'
        }
      ]
    }
  ]
  });
