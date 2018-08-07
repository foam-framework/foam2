foam.CLASS({
  package: 'foam.swift.type',
  name: 'Date',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 1 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `return o is Date`,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! Date
        guard let b = o2 as? Date else { return 1 }
        return FOAM_utils.compare(a.timeIntervalSince1970, b.timeIntervalSince1970)
      `,
    },
  ],
});
