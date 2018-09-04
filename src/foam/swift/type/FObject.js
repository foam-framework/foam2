foam.CLASS({
  package: 'foam.swift.type',
  name: 'FObject',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 0 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `return o is foam_core_FObject`,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! foam_core_FObject
        guard let b = o2 as? foam_core_FObject else { return 1 }
        return a.compareTo(b)
      `,
    },
  ],
});
