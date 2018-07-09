/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
