/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse',
  name: 'StringPStream',
  implements: [
    'foam.swift.parse.PStream',
  ],
  properties: [
    {
      swiftType: '[Character]',
      name: 'str',
      swiftAdapt: function() {/*
if let s = newValue as? String {
  return Array(s)
}
return newValue as! [Character]
      */},
    },
    {
      name: 'value_',
    },
    {
      class: 'Int',
      name: 'pos',
    },
    {
      swiftType: 'StringPStream?',
      name: 'tail_',
    },
  ],
  methods: [
    {
      name: 'head',
      swiftCode: function() {/*
return str[pos]
      */},
    },
    {
      name: 'valid',
      swiftCode: function() {/*
return pos < str.count
      */},
    },
    {
      name: 'tail',
      swiftCode: function() {/*
if tail_ == nil {
  tail_ = StringPStream([
    "str": str,
    "pos": pos + 1,
  ])
}
return tail_!
      */},
    },
    {
      name: 'substring',
      swiftCode: function() {/*
let startIndex = pos
let endIndex = (end as! StringPStream).pos
return String(str[startIndex..<endIndex])
      */},
    },
    {
      name: 'value',
      swiftReturns: 'Any?',
      swiftCode: function() {/*
return value_
      */},
    },
    {
      name: 'setValue',
      swiftCode: function() {/*
let ps = StringPStream([
  "str": str,
  "pos": pos,
  "value_": value,
])
return ps
      */},
    },
  ]
});
