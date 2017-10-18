/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'AnyKeyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.parser.Alt',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.NotChars',
    'foam.swift.parse.parser.Repeat0',
    'foam.swift.parse.parser.Seq1',
    'foam.swift.parse.parser.Substring',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return Alt_create(["parsers": [
  Seq1_create(["index": 1, "parsers": [
    Literal_create(["string": "\""]),
    Substring_create(["delegate":
      Repeat0_create(["delegate":
        NotChars_create(["chars": "\""]),
      ])
    ]),
    Literal_create(["string": "\""]),
  ]]),
  Seq1_create(["index": 0, "parsers": [
    Substring_create(["delegate":
      Repeat0_create(["delegate":
        NotChars_create(["chars": "{}, :"]),
      ])
    ])
  ]])
]])
      */},
    },
  ],
});
