/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'PropertyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.KeyParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Seq1',
  ],
  properties: [
    {
      swiftType: 'PropertyInfo',
      name: 'property',
    },
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1_create(["index": 5, "parsers": [
    Whitespace_create(),
    KeyParser_create(["key": self.property.name]),
    Whitespace_create(),
    Literal_create(["string": ":"]),
    Whitespace_create(),
    self.property.jsonParser!,
    Whitespace_create(),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = super.parse(ps, x);
if ps == nil { return nil }
let args = x.get("obj") as! Reference<[String:Any?]>
args.value[property.name] = ps!.value()
return ps
      */},
    },
  ],
});
