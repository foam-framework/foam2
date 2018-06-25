/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Seq2',
  implements: ['foam.swift.parse.parser.Parser'],
  properties: [
    {
      class: 'Array',
      of: 'foam.swift.parse.parser.Parser',
      name: 'parsers',
    },
    {
      class: 'Int',
      name: 'index1',
    },
    {
      class: 'Int',
      name: 'index2',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var values = [Any?](repeating: nil, count: 2)
var ps: foam_swift_parse_PStream? = ps
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  if i == index1 { values[0] = ps!.value() }
  if i == index2 { values[1] = ps!.value() }
}
return ps!.setValue(values)
      */},
    },
  ]
});

