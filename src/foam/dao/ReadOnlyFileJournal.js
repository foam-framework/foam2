/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ReadOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  methods: [
    {
      name: 'put',
      javaCode: `
      return dao.put_(x, obj);
      `
    },
    {
      name: 'remove',
      javaCode: `
      return dao.remove_(x, obj);
      `
    }
  ]
});
