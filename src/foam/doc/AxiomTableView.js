/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomTableView',
  extends: 'foam.u2.view.UnstyledTableView',
  properties: [
    {
      name: 'editColumnsEnabled',
      value: false,
    },
    {
      name: 'disableUserSelection',
      value: true,
    },
  ],
  css: `
    ^ {
      border-collapse: collapse;
      width: 100%;
      font-size: 14px;
    }
    ^ thead {
      background-color: #dee3e9;
    }
    ^ th {
      text-align: left;
      padding: 8px 3px 3px 7px;
    }
    ^ tbody > tr:nth-child(odd) {
      background-color: #f6f9f9;
    }
    ^ tbody > tr:nth-child(even) {
      background-color: #ffffff;
    }
    ^ td {
      vertical-align: top;
      padding: 8px 3px 3px 7px;
    }
    ^documentation {
      margin: 3px 10px 2px 0px;
    }
  `
});
