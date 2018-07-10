/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'JournalEntry',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'Enum',
      of: 'foam.dao.journal.JournalEntryCommand',
      name: 'cmd'
    },
    {
      class: 'FObjectProperty',
      name: 'data'
    }
  ],

  methods: [
    {
      name: 'replay',
      args: [
        {
          name: 'dao',
          of: 'foam.dao.DAO',
        },
      ],
      javaCode: `
        switch ( getCmd() ) {
          case PUT:
            dao.put(getData());
            break;
          case REMOVE:
            dao.remove(getData());
            break;
        }
      `,
    },
  ],
});
