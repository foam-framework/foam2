/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao.journal',
  name: 'CommentJournalEntry',
  extends: 'foam.dao.journal.ProxyJournalEntry',
  properties: [
    {
      class: 'String',
      name: 'comment',
    },
  ],
});
