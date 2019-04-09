/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.analytics',
  name: 'StockSnapshot',
  ids: ['time', 'symbol'],
  properties: [
    {
      class: 'DateTime',
      name: 'time'
    },
    {
      class: 'String',
      name: 'symbol'
    },
    {
      class: 'Float',
      name: 'price'
    }
  ]
});