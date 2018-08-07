foam.INTERFACE({
  package: 'foam.swift.type',
  name: 'Type',
  properties: [
    {
      class: 'Int',
      name: 'ordinal'
    },
  ],
  methods: [
    {
      name: 'isInstance',
      args: [
        { name: 'o' },
      ],
      swiftReturns: 'Bool',
    },
    {
      name: 'compare',
      args: [
        { name: 'o1' },
        { name: 'o2' },
      ],
      swiftReturns: 'Int',
    },
  ],
});
