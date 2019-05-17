/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'NotChars',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Multiton.create({ property: 'chars' })
  ],
  properties: [
    {
      type: 'String',
      required: true,
      name: 'chars',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = ps!
if ps.valid() && chars.index(of: ps.head()) == -1 {
  return ps.tail()!.setValue(ps.head())
}
return nil
      */},
    },
  ]
});
