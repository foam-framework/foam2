/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Seq0',
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
for parser in parsers {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
}
return ps
      */},
    },
  ]
});

