/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'BooleanParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.parser.Alt',
    'foam.swift.parse.parser.Literal',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return Alt_create(["parsers": [
  Literal_create(["string": "true", "value": true]),
  Literal_create(["string": "false", "value": false]),
]])
      */},
    },
  ],
});
