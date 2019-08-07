/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'ProxyCSVOutputter',
  implements: [
    'foam.lib.csv.CSVOutputter'
  ],
  properties: [
    {
      class: 'Proxy',
      of: 'foam.lib.csv.CSVOutputter',
      name: 'delegate'
    }
  ]
});