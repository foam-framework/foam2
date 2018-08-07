foam.CLASS({
  package: 'foam.swift.type',
  name: 'String',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 5 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `
        return o is String
      `,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! String
        guard let b = o2 as? String else { return 1 }
        return a.compare(b).rawValue
      `,
    },
  ],
});
