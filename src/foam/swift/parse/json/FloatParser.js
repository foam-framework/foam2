/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'FloatParser',
  implements: ['foam.swift.parse.parser.Parser'],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps!
var n: [Character] = []
var decimalFound = false

if !ps.valid() { return nil }

var c = ps.head()

if c == "-" {
  n.append(c)
  ps = ps.tail()!
  if !ps.valid() { return nil }
  c = ps.head()
}

// Float numbers must start with a digit: 0.1, 4.0
if c.isDigit() { n.append(c) }
else { return nil }

ps = ps.tail()!
while ps.valid() {
  c = ps.head()
  if c.isDigit() {
    n.append(c)
  } else if c == "." { // TODO: localization
    if decimalFound {
      return nil
    }
    decimalFound = true;
    n.append(c)
  } else {
    break;
  }
  ps = ps.tail()!
}

if !decimalFound { return nil }

return ps.setValue(n.count > 0 ? Float(String(n)) : nil)
      */},
    },
  ]
});
