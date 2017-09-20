foam.INTERFACE({
  refines: 'foam.mlang.order.Comparator',
  methods: [
    {
      name: 'compare',
      swiftReturns: 'Int',
      swiftEnabled: true,
      args: ['o1', 'o2'],
    },
  ]
});
