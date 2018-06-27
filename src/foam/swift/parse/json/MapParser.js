/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'MapParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.AnyKeyParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Repeat',
    'foam.swift.parse.parser.Seq0',
    'foam.swift.parse.parser.Seq1',
    'foam.swift.parse.parser.Seq2',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1_create(["index": 2, "parsers": [
    Whitespace_create(),
    Literal_create(["string": "{"]),
    Repeat_create([
      "delegate":
        Seq2_create(["index1": 1, "index2": 5, "parsers": [
          Whitespace_create(),
          AnyKeyParser_create(),
          Whitespace_create(),
          Literal_create(["string": ":"]),
          Whitespace_create(),
          __context__.create(foam_swift_parse_json_AnyParser.self)!,
        ]]),
      "delim":
        Seq0_create(["parsers": [
          Whitespace_create(),
          Literal_create(["string": ","]),
        ]])
    ]),
    Whitespace_create(),
    Literal_create(["string": "}"]),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = super.parse(ps, x)
if ps != nil {
  let values = ps!.value() as! [Any?]
  var map: [String:Any?] = [:]
  for item in values {
    let item = item as! [Any?]
    map[item[0] as! String] = item[1]
  }
  return ps!.setValue(map)
}
return ps
      */},
    },
  ],
});
