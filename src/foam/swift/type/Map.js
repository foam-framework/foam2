foam.CLASS({
  package: 'foam.swift.type',
  name: 'Map',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 2 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `
        return o is [String:Any?]
      `,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! [String:Any?]
        guard let b = o2 as? [String:Any?] else { return 1 }

        var aKeys = Array(a.keys)
        aKeys.sort()
        var bKeys = Array(b.keys)
        bKeys.sort()
        var c = FOAM_utils.compare(aKeys, bKeys)
        if c != 0 { return c }

        for k in aKeys {
          c = FOAM_utils.compare(a[k] ?? nil, b[k] ?? nil)
          if ( c != 0 ) { return c }
        }
        return 0
      `,
    },
  ],
});
