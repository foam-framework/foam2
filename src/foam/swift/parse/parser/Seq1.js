/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Seq1',
  implements: ['foam.swift.parse.parser.Parser'],
  properties: [
    {
      class: 'Array',
      of: 'foam.swift.parse.parser.Parser',
      name: 'parsers',
    },
    {
      class: 'Int',
      name: 'index',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var value: Any? = nil
var ps: foam_swift_parse_PStream? = ps
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  if i == index { value = ps!.value() }
}
return ps!.setValue(value)
      */},
    },
  ]
});
