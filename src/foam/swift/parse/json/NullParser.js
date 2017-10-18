/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'NullParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.parser.Literal',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
  {
    name: 'delegate',
    swiftFactory: 'return Literal_create(["string": "null", "value": nil])',
  },
  ],
});
