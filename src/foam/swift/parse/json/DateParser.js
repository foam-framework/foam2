/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'DateParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
  {
    name: 'delegate',
    swiftFactory: function() {/*
fatalError("TODO: Learn to parse dates.")
    */},
  },
  ],
});
