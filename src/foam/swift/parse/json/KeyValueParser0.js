/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'KeyValueParser0',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.AnyKeyParser',
    'foam.swift.parse.json.AnyParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Seq0',
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq0_create(["parsers": [
    Whitespace_create(),
    AnyKeyParser_create(),
    Whitespace_create(),
    Literal_create(["string": ":"]),
    AnyParser_create(),
  ]])
      */},
    },
  ],
});
