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
    'openTime',
    'closeTime',
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
      name: 'openValueTime',
      hidden: true
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
      class: 'DateTime',
      name: 'closeValueTime',
      hidden: true
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
