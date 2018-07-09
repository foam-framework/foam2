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
      javaCode: '// NOOP',
    },
  ],
});
