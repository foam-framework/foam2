/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
