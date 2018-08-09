foam.CLASS({
  package: 'foam.swift.type',
  name: 'Unknown',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 10 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `return true`,
    },
    {
      name: 'compare',
      swiftCode: `return 0`,
    },
  ],
});
