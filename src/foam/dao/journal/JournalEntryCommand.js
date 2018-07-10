/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.dao.journal',
  name: 'JournalEntryCommand',

  values: [
    {
      name: 'PUT',
      label: 'Put'
    },
    {
      name: 'REMOVE',
      label: 'Remove'
    }
  ]
});
