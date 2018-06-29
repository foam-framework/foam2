foam.CLASS({
  package: 'foam.dao.journal',
  name: 'RemoveJournalEntry',
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
      javaCode: `dao.remove(getData());`,
    },
  ],
});
