foam.INTERFACE({
  package: 'foam.nanos.mrac',
  name: 'ElectoralService',

  methods: [
    {
      name: 'dissolve',
      args: [
        {
          name: 'clients',
          class: 'FObjectArray',
          of: 'foam.dao.DAO'
        }
      ]
    },
    {
      name: 'vote',
      type: 'Integer',
      args: [
        {
          name: 'client',
          type: 'foam.dao.DAO'
        }
      ]
    },
    {
      name: 'report',
      args: [
        {
          name: 'clients',
          class: 'FObjectArray',
          of: 'foam.dao.DAO'
        }
      ]
    }
  ]
  });
