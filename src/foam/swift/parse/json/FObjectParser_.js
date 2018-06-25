/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'FObjectParser_',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.KeyParser',
    'foam.swift.parse.json.StringParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Optional',
    'foam.swift.parse.parser.Seq1',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1_create(["index": 4, "parsers": [
    KeyParser_create(["key": "class"]),
    Whitespace_create(),
    Literal_create(["string": ":"]),
    Whitespace_create(),
    StringParser_create(),
    Optional_create(["delegate": 
      Literal_create(["string": ","]),
    ])
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps: foam_swift_parse_PStream? = ps
guard let ps1 = delegate.parse(ps!, x),
      let c: ClassInfo = __subContext__.lookup(ps1.value() as! String) else {
  return nil
}
ps = ps1


let subx = x.sub()
let args: Reference<[String:Any?]> = Reference(value: [:])
subx.set("obj", args)
ps = ModelParserFactory.getInstance(c).parse(ps!, subx)

if ps != nil {
  let obj = c.create(args: args.value, x: x.get("X") as! Context)
  return ps!.setValue(obj)
}

return nil
      */},
    },
  ],
});
