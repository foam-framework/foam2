/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'UnknownPropertyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.KeyValueParser0',
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: 'return KeyValueParser0_create()',
    },
  ],
});
