foam.CLASS({
  package: 'foam.dao.journal',
  name: 'CommentJournalEntry',
  extends: 'foam.dao.journal.ProxyJournalEntry',
  properties: [
    {
      class: 'String',
      name: 'comment',
    },
  ],
});
