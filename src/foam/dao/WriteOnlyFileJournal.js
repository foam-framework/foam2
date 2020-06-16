/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyFileJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      name: 'outputClassNames',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'replay',
      javaCode: `
        return;
      `
    }
  ]
});
