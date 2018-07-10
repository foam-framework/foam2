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
    {
      class: 'Long',
      name: 'id',
      javaGetter: `return getDelegate().getId();`,
      javaSetter: `getDelegate().setId(val);`
    },
    {
      class: 'Enum',
      of: 'foam.dao.journal.JournalEntryCommand',
      name: 'cmd',
      javaGetter: `return getDelegate().getCmd();`,
      javaSetter: `getDelegate().setCmd(val);`
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      javaGetter: `return getDelegate().getData();`,
      javaSetter: `getDelegate().setCmd(val);`
    }
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `getDelegate().replay(dao);`,
    },
  ],
});
