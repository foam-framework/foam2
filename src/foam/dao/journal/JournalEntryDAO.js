foam.CLASS({
  package: 'foam.dao.journal',
  name: 'JournalEntryDAO',
  extends: 'foam.dao.ProxyDAO',
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'journalEntryDAO',
    },
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
getJournalEntryDAO().put_(x, (foam.core.FObject) x.get("journalEntry"));
return getDelegate().put_(x, obj);
      `,
    },
    {
      name: 'remove_',
      javaCode: `
getJournalEntryDAO().put_(x, (foam.core.FObject) x.get("journalEntry"));
return getDelegate().remove_(x, obj);
      `,
    },
  ],
});
