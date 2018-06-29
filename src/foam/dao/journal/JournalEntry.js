foam.CLASS({
  package: 'foam.dao.journal',
  name: 'JournalEntry',
  properties: [
    {
      class: 'Long',
      name: 'id',
    },
  ],
  methods: [
    {
      name: 'replay',
      args: [
        {
          name: 'dao',
          of: 'foam.dao.DAO',
        },
      ],
      javaCode: '// NOOP',
    },
  ],
});
