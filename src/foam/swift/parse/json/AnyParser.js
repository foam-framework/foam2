/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.parse.json',
  name: 'AnyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.ArrayParser',
    'foam.swift.parse.json.BooleanParser',
    'foam.swift.parse.json.FObjectParser',
    'foam.swift.parse.json.FloatParser',
    'foam.swift.parse.json.IntParser',
    'foam.swift.parse.json.LongParser',
    'foam.swift.parse.json.MapParser',
    'foam.swift.parse.json.NullParser',
    'foam.swift.parse.json.StringParser',
    'foam.swift.parse.parser.Alt',
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return Alt_create(["parsers": [
  NullParser_create(),
  StringParser_create(),
  FloatParser_create(),
  LongParser_create(),
  IntParser_create(),
  BooleanParser_create(),
  FObjectParser_create(),
  ArrayParser_create(),
  MapParser_create(),
]])
      */},
    },
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
});
