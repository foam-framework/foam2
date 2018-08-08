foam.CLASS({
  package: 'foam.swift.type',
  name: 'Null',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 8 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `
        return o == nil
      `,
    },
    {
      name: 'compare',
      swiftCode: `
        return o2 == nil ? 0 : 1
      `,
    },
  ],
});
