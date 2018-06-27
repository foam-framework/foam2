/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Seq',
  implements: ['foam.swift.parse.parser.Parser'],
  properties: [
    {
      class: 'Array',
      of: 'foam.swift.parse.parser.Parser',
      name: 'parsers',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps: foam_swift_parse_PStream? = ps
var values = [Any?](repeating: nil, count: parsers.count)
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  values[i] = ps!.value()
}
return ps!.setValue(values)
      */},
    },
  ]
});
