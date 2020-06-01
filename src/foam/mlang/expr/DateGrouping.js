/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'DateGrouping',
  documentation: `
    A model used to define a date range
  `,

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Int',
      name: 'low',
      documentation: 'Lower bound inclusive',
      value: -2147483648
    },
    {
      class: 'Int',
      name: 'high',
      documentation: 'Upper bound exclusive',
      value: 2147483647
    }
  ]
});
