foam.CLASS({
  package: 'foam.dao.journal',
  name: 'PutJournalEntry',
  extends: 'foam.dao.journal.JournalEntry',
  properties: [
    {
      class: 'FObjectProperty',
      name: 'data',
    },
  ],
  methods: [
    {
      name: 'replay',
      javaCode: `dao.put(getData());`,
    },
  ],
});
