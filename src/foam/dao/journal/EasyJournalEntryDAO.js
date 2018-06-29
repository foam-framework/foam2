foam.CLASS({
  package: 'foam.dao.journal',
  name: 'EasyJournalEntryDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.SequenceNumberDAO',
    'foam.dao.journal.UserCommentJournalEntryDAODecorator',
    'foam.dao.journal.JournalEntryDAO',
    'foam.dao.journal.PutRemoveJournalDAODecorator',
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'journalEntryDAO',
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'destinationDAO',
    },
    {
      name: 'delegate',
      javaFactory: `
foam.dao.DAO j = getJournalEntryDAO();
j = new foam.dao.SequenceNumberDAO.Builder(getX())
  .setDelegate(j)
  .setOf(j.getOf())
  .build();

foam.dao.DAO d =  new foam.dao.journal.JournalEntryDAO.Builder(getX())
  .setDelegate(getDestinationDAO())
  .setJournalEntryDAO(j)
  .build();
d = new foam.dao.journal.UserCommentJournalEntryDAODecorator.Builder(getX())
  .setDelegate(d)
  .build();
d = new foam.dao.journal.PutRemoveJournalDAODecorator.Builder(getX())
  .setDelegate(d)
  .build();

return d;
      `,
    },
  ],
});
