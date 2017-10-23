/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Alt',
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
for parser in parsers {
  let ret = parser.parse(ps, x)
  if ret != nil { return ret }
}
return nil
      */},
    },
  ]
});
