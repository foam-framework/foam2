/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'KeyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.parser.Alt',
    'foam.swift.parse.parser.Literal',
  ],
  axioms: [
    foam.pattern.Multiton.create({ property: 'key' })
  ],
  properties: [
    {
      class: 'String',
      name: 'key',
    },
    {
      name: 'delegate',
      swiftExpressionArgs: ['key'],
      swiftExpression: function() {/*
return self.Alt_create(["parsers": [
  self.Literal_create(["string": "\"" + key + "\""]),
  self.Literal_create(["string": key]),
]])
      */},
    },
  ],
});
