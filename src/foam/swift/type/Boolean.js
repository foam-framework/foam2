foam.CLASS({
  package: 'foam.swift.type',
  name: 'Boolean',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 7 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `
        return o is Bool
      `,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! Bool
        guard let b = o2 as? Bool else { return 1 }
        return a ? (b ? 0 : 1) : (b ? -1 : 0)
      `,
    },
  ],
});
