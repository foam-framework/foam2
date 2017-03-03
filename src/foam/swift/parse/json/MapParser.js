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
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1(["index": 2, "parsers": [
    Whitespace(),
    Literal(["string": "{"]),
    Repeat([
      "delegate":
        Seq2(["index1": 1, "index2": 5, "parsers": [
          Whitespace(),
          AnyKeyParser(),
          Whitespace(),
          Literal(["string": ":"]),
          Whitespace(),
          AnyParser(),
        ]]),
      "delim":
        Seq0(["parsers": [
          Whitespace(),
          Literal(["string": ","]),
        ]])
    ]),
    Whitespace(),
    Literal(["string": "}"]),
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
