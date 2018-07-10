/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'JournalEntryDAO',
  extends: 'foam.dao.ProxyDAO',
  requires: [
    'foam.dao.AbstractSink',
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
getJournalEntryDAO().select(new foam.dao.AbstractSink() {
  public void put(Object obj, foam.core.Detachable sub) {
    ((foam.dao.journal.JournalEntry)(obj)).replay(getDestinationDAO());
  }
});
return getDestinationDAO();
      `,
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
