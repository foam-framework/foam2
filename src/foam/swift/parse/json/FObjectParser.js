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
      swiftReturns: 'foam_core_FObject?',
      args: [
        {
          swiftType: 'String',
          name: 'str',
        },
        {
          swiftType: 'Context?',
          swiftDefaultValue: 'nil',
          name: 'x',
        },
      ],
      swiftCode: function() {/*
let ps = StringPStream_create(["str": str])
let parserContext = ParserContext()
parserContext.set("X", x ?? __subContext__)
return parse(ps, parserContext)?.value() as? foam_core_FObject
      */},
    },
  ],
});
