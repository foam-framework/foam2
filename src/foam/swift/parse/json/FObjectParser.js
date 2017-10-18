/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'FObjectParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.StringPStream',
    'foam.swift.parse.json.FObjectParser_',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Seq1',
    'foam.swift.parse.parser.Literal',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return
  Seq1_create(["index": 3, "parsers": [
    Whitespace_create(),
    Literal_create(["string": "{"]),
    Whitespace_create(),
    FObjectParser__create(),
    Whitespace_create(),
    Literal_create(["string": "}"]),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parseString',
      swiftReturns: 'FObject?',
      args: [
        {
          class: 'String',
          name: 'str',
        },
      ],
      swiftCode: function() {/*
let ps = StringPStream_create(["str": str])
let x = ParserContext()
x.set("X", __subContext__)
return parse(ps, x)?.value() as? FObject
      */},
    },
  ],
});
