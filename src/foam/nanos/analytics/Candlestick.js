/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'Candlestick',
  ids: ['closeTime', 'key'],

  documentation: `
    Represents a single candlestick in a financial candlestick chart. See
    https://en.wikipedia.org/wiki/Candlestick_chart.

    Each candlestick represents four measurements of some variable over a fixed
    timespan:
      1. The value at the beginning of the timespan, called "open"
      2. The value at the end of the timespan, called "close"
      3. The maximum value observed during the timespan, called "max"
      4. The minimum value observed during the timespan, called "min"
  `,

  tableColumns: [
    'key',
    'openValueTime',
    'closeValueTime',
    'open',
    'close',
    'min',
    'max',
    'average'
  ],
  properties: [
    {
      class: 'Object',
      name: 'key',
      visibility: 'RO',
      tableWidth: '350'
    },
    {
      class: 'Float',
      name: 'min',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'max',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'open',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'openValueTime',
      visibility: 'RO',
      tableWidth: 150
    },
    {
      class: 'DateTime',
      name: 'closeTime',
      visibility: 'RO',
      tableWidth: 150
    },
    {
      class: 'Float',
      name: 'close',
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'closeValueTime',
      visibility: 'RO',
      tableWidth: 150
    },
    {
      class: 'Float',
      name: 'total',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'count',
      visibility: 'RO'
    },
    {
      class: 'Float',
      name: 'average',
      visibility: 'RO',
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
        },
        {
          type: 'Date',
          name: 'time'
        }
      ],
      javaCode: `
setMin(isPropertySet("min") ? Math.min(v, getMin()) : v);
setMax(isPropertySet("max") ? Math.max(v, getMax()) : v);

if ( ! isPropertySet("openValueTime") || time.compareTo(getOpenValueTime()) < 0 ) {
  setOpenValueTime(time);
  setOpen(v);
}

if ( ! isPropertySet("closeValueTime") || time.compareTo(getCloseValueTime()) > 0 ) {
  setCloseValueTime(time);
  setClose(v);
}

setTotal(getTotal() + v);
setCount(getCount() + 1);
      `
    },
    {
      name: 'reduce',
      args: [
        {
          type: 'foam.nanos.analytics.Candlestick',
          name: 'c'
        }
      ],
      javaCode: `
setMin(isPropertySet("min") ? Math.min(c.getMin(), getMin()) : c.getMin());
setMax(isPropertySet("max") ? Math.max(c.getMax(), getMax()) : c.getMax());

if ( ! isPropertySet("openValueTime") || c.getOpenValueTime().compareTo(getOpenValueTime()) < 0 ) {
  setOpenValueTime(c.getOpenValueTime());
  setOpen(c.getOpen());
}

if ( ! isPropertySet("closeValueTime") || c.getCloseValueTime().compareTo(getCloseValueTime()) > 0 ) {
  setCloseValueTime(c.getCloseValueTime());
  setClose(c.getClose());
}

setTotal(getTotal() + c.getTotal());
setCount(getCount() + c.getCount());
      `
    }
  ]
});
