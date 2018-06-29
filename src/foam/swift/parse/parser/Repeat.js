/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.parser',
  name: 'Repeat',
  extends: 'foam.swift.parse.parser.ProxyParser',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.parser.Parser',
      required: false,
      name: 'delim',
    },
    {
      class: 'Int',
      name: 'min',
      value: -1,
    },
    {
      class: 'Int',
      name: 'max',
      value: -1,
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps
var values: [Any?] = []
var result: foam_swift_parse_PStream?

var i = 0
while max == -1 || i < max {
  if delim != nil && values.count != 0 {
    result = delim!.parse(ps, x)
    if result == nil { break }
    ps = result!
  }

  result = delegate.parse(ps, x)
  if result == nil { break }

  values.append(result!.value())
  ps = result!

  i+=1
}

if min != -1 && values.count < min { return nil }
return ps.setValue(values)
      */},
    },
  ]
});
