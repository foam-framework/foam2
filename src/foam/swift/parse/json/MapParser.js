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
  name: 'MapParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.json.AnyKeyParser',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Literal',
    'foam.swift.parse.parser.Repeat',
    'foam.swift.parse.parser.Seq0',
    'foam.swift.parse.parser.Seq1',
    'foam.swift.parse.parser.Seq2',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1_create(["index": 2, "parsers": [
    Whitespace_create(),
    Literal_create(["string": "{"]),
    Repeat_create([
      "delegate":
        Seq2_create(["index1": 1, "index2": 5, "parsers": [
          Whitespace_create(),
          AnyKeyParser_create(),
          Whitespace_create(),
          Literal_create(["string": ":"]),
          Whitespace_create(),
          __context__.create(AnyParser.self)!,
        ]]),
      "delim":
        Seq0_create(["parsers": [
          Whitespace_create(),
          Literal_create(["string": ","]),
        ]])
    ]),
    Whitespace_create(),
    Literal_create(["string": "}"]),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = super.parse(ps, x)
if ps != nil {
  let values = ps!.value() as! [Any?]
  var map: [String:Any?] = [:]
  for item in values {
    let item = item as! [Any?]
    map[item[0] as! String] = item[1]
  }
  return ps!.setValue(map)
}
return ps
      */},
    },
  ],
});
