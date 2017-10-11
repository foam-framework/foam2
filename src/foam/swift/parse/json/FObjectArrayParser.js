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
  name: 'FObjectArrayParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.FObjectParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Repeat',
    'foam.swift.parse.parser.Seq0',
    'foam.swift.parse.parser.Seq1',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
  {
    name: 'delegate',
    swiftFactory: function() {/*
return Seq1_create(["index": 3, "parsers": [
  Whitespace_create(),
  Literal_create(["string": "["]),
  Whitespace_create(),
  Repeat_create([
    "delegate": FObjectParser_create(),
    "delim": Seq0_create(["parsers": [
      Whitespace_create(),
      Literal_create(["string": ","]),
      Whitespace_create(),
    ]]),
  ]),
  Whitespace_create(),
  Literal_create(["string": "]"]),
]])
    */},
  },
  ],
});
