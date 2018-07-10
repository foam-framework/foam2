/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'PutRemoveJournalDAODecorator',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
x = x.put("journalEntry", new foam.dao.journal.JournalEntry.Builder(x)
    .setCmd(JournalEntryCommand.PUT)
    .setData(obj)
    .build());
return getDelegate().put_(x, obj);
      `,
    },
    {
      name: 'remove_',
      javaCode: `
x = x.put("journalEntry", new foam.dao.journal.JournalEntry.Builder(x)
    .setCmd(JournalEntryCommand.REMOVE)
    .setData(obj)
    .build());
return getDelegate().remove_(x, obj);
      `,
    },
  ],
});
