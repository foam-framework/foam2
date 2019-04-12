/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'Candlestick',
  ids: ['closeTime', 'key'],
  tableColumns: [
    'key',
    'open',
    'close',
    'min',
    'max',
    'average'
  ],
  properties: [
    {
      class: 'Object',
      name: 'key'
    },
    {
      class: 'Float',
      name: 'min'
    },
    {
      class: 'Float',
      name: 'max'
    },
    {
      class: 'DateTime',
      name: 'openTime'
    },
    {
      class: 'Float',
      name: 'open'
    },
    {
      class: 'DateTime',
      name: 'closeTime'
    },
    {
      class: 'Float',
      name: 'close'
    },
    {
      class: 'Float',
      name: 'total'
    },
    {
      class: 'Float',
      name: 'count'
    },
    {
      class: 'Float',
      name: 'average',
      transient: true,
      javaGetter: 'return getCount() > 0 ? getTotal() / getCount() : 0;',
      expression: function(total, count) {
        return count ? total / count : 0;
      }
    }
  ],
  methods: [
    {
      name: 'add',
      args: [
        {
          type: 'Float',
          name: 'v'
        }
      ],
      javaCode: `
        setMin(isPropertySet("min") ? Math.min(v, getMin()) : v);
        setMax(isPropertySet("max") ? Math.max(v, getMax()) : v);
        setClose(v);
        setTotal(getTotal() + v);
        setCount(getCount() + 1);
      `
    }
  ]
});