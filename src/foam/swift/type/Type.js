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
      type: 'Boolean',
    },
    {
      name: 'compare',
      args: [
        { name: 'o1' },
        { name: 'o2' },
      ],
      swiftType: 'Int',
    },
  ],
});
