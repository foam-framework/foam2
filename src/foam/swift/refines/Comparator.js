foam.INTERFACE({
  refines: 'foam.mlang.order.Comparator',
  methods: [
    {
      name: 'compare',
      swiftReturns: 'Int',
      args: ['o1', 'o2'],
    },
  ]
});
