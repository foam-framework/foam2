/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'Whitespace',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps!
while ps.valid() {
  let c = ps.head()
  if c == " "  || c == "\t" || c == "\r" || c == "\n" {
    ps = ps.tail()!
  } else {
    return ps;
  }
}
return nil
      */},
    },
  ],
});
