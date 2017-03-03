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
  name: 'FObjectParser_',
  extends: 'foam.swift.parse.parser.ProxyParser',
  properties: [
    {
      swiftType: 'Any!',
      name: 'defaultClass',
    },
    {
      name: 'delegate',
      swiftFactory: function() {/*
return 
  Seq1(["index": 4, "parsers": [
    KeyParser(["key": "class"]),
    Whitespace(),
    Literal(["string": ":"]),
    Whitespace(),
    StringParser(),
    Optional(["delegate": 
      Literal(["string": ","]),
    ])
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps: PStream? = ps
let ps1 = delegate.parse(ps!, x)

let c = ps1 != nil ? x[ps1!.value() as! String] :
   x["defaultClass"] != nil ? x["defaultClass"] :
   defaultClass

if c == nil {
  fatalError("No class specified in JSON and no defaultClass available.");
}

if ps1 != nil {
 ps = ps1
}

let subx = x.createSubContext(args: [
  "obj": (x["X"] as! Context).create(type: c!)!,
])
ps = ModelParserFactory.getInstance(c as! FObject.Type).parse(ps!, subx)

if ps != nil {
  return ps!.setValue(subx["obj"])
}
return nil
      */},
    },
  ],
});
