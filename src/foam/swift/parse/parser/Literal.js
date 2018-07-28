/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Literal',
  implements: ['foam.swift.parse.parser.Parser'],
  properties: [
    {
      class: 'String',
      name: 'string',
    },
    {
      name: 'value',
      swiftExpressionArgs: ['string'],
      swiftExpression: 'return string'
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps
for i in 0..<string.count {
  if !ps.valid() || ps.head() != string.char(at: i) {
    return nil
  }
  ps = ps.tail()
}
return ps.setValue(self.value)
      */},
    },
  ]
});
