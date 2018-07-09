/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'PutRemoveJournalDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.journal.PutJournalEntry',
    'foam.dao.journal.RemoveJournalEntry',
  ],
  methods: [
    {
      name: 'put_',
      javaCode: `
x = x.put(
  "journalEntry",
  new foam.dao.journal.PutJournalEntry
    .Builder(x)
    .setData(obj)
    .build());
return getDelegate().put_(x, obj);
      `,
    },
    {
      name: 'remove_',
      javaCode: `
x = x.put(
  "journalEntry",
  new foam.dao.journal.RemoveJournalEntry
    .Builder(x)
    .setData(obj)
    .build());
return getDelegate().remove_(x, obj);
      `,
    },
  ],
});
