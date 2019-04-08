/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'LongParser',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps!
var n = 0

var negate = false

if !ps.valid() { return nil }

var c = ps.head()

if c == "-" {
  negate = true
  ps = ps.tail()!
  if !ps.valid() { return nil }
  c = ps.head()
}

if c.isDigit() { n = Int(String(c))! }
else { return nil }

ps = ps.tail()!

while ( ps.valid() ) {
  c = ps.head()
  if c.isDigit() {
    n *= 10
    n += Int(String(c))!
  } else {
    break
  }
  ps = ps.tail()!
}

if negate { n *= -1 }

return ps.setValue(n)
      */},
    },
  ]
});

