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