foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'Candlestick',
  ids: ['end'],
  properties: [
    {
      class: 'DateTime',
      name: 'end'
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
        },
        {
          type: 'Date',
          name: 'time'
        }
      ],
      javaCode: `
        setMin(isPropertySet("min") ? Math.min(v, getMin()) : v);
        setMax(isPropertySet("max") ? Math.max(v, getMax()) : v);
        if ( ! isPropertySet("openTime") || time.compareTo(getOpenTime()) < 0 ) {
          setOpenTime(time);
          setOpen(v);
        }
        if ( ! isPropertySet("closeTime") || time.compareTo(getCloseTime()) > 0 ) {
          setCloseTime(time);
          setClose(v);
        }
        setTotal(getTotal() + v);
        setCount(getCount() + 1);
      `
    }
  ]
});