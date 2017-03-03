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
  name: 'PropertyParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  properties: [
    {
      swiftType: 'PropertyInfo',
      name: 'property',
    },
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1(["index": 5, "parsers": [
    Whitespace(),
    KeyParser(["key": self.property.name]),
    Whitespace(),
    Literal(["string": ":"]),
    Whitespace(),
    self.property.jsonParser!,
    Whitespace(),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
let ps = super.parse(ps, x);
if ps == nil { return nil }
property.set(x["obj"] as! FObject, value: ps!.value())
return ps
      */},
    },
  ],
});
