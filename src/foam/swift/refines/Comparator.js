foam.INTERFACE({
  refines: 'foam.mlang.order.Comparator',
  methods: [
    {
      name: 'compare',
      swiftReturnType: 'Int',
      swiftEnabled: true,
      args: ['o1', 'o2'],
    },
  ]
});
