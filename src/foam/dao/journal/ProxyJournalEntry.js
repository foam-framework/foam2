/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'ProxyJournalEntry',
  extends: 'foam.dao.journal.JournalEntry',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.dao.journal.JournalEntry',
      name: 'delegate',
    },
  ],
  methods: [
    {
      name: 'replay',
      javaCode: `getDelegate().replay(dao);`,
    },
  ],
});
