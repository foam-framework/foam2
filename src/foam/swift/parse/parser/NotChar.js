/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'NotChar',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Multiton.create({ property: 'ch' })
  ],
  properties: [
    {
      swiftType: 'Character',
      name: 'ch',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = ps!
return ps.valid() && ps.head() != ch ? ps.tail()!.setValue(ps.head()) : nil
      */},
    },
  ]
});
