/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'StringParser',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let escape_: Character = "\\"
let delim_ = ps!.head()
if delim_ != "\"" && delim_ != "'" { return nil }

var ps = ps!.tail()!;
var lastc = delim_;

var sb = ""
while ps.valid() {
  let c = ps.head()
  if c == delim_ && lastc != escape_ {
    break
  }
  if c != escape_ { sb.append(c) }
  lastc = c
  ps = ps.tail()!
}
return ps.tail()!.setValue(sb)
      */},
    },
  ]
});
