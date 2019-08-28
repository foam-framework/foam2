/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.type',
  name: 'Number',
  implements: ['foam.swift.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    { name: 'ordinal', value: 6 },
  ],
  methods: [
    {
      name: 'isInstance',
      swiftCode: `
        return o is NSNumber
      `,
    },
    {
      name: 'compare',
      swiftCode: `
        let a = o1 as! NSNumber
        guard let b = o2 as? NSNumber else { return 1 }
        return a.compare(b).rawValue
      `,
    },
  ],
});
