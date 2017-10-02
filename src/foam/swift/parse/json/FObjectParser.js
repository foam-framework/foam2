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
  name: 'FObjectParser',
  extends: 'foam.swift.parse.parser.ProxyParser',
  requires: [
    'foam.swift.parse.StringPStream',
    'foam.swift.parse.json.FObjectParser_',
    'foam.swift.parse.json.Whitespace',
    'foam.swift.parse.parser.Seq1',
    'foam.swift.parse.parser.Literal',
  ],
  axioms: [
    foam.pattern.Singleton.create()
  ],
  properties: [
    {
      name: 'delegate',
      swiftFactory: function() {/*
return
  Seq1_create(["index": 3, "parsers": [
    Whitespace_create(),
    Literal_create(["string": "{"]),
    Whitespace_create(),
    FObjectParser__create(),
    Whitespace_create(),
    Literal_create(["string": "}"]),
  ]])
      */},
    },
  ],
  methods: [
    {
      name: 'parseString',
      swiftReturns: 'FObject?',
      args: [
        {
          class: 'String',
          name: 'str',
        },
      ],
      swiftCode: function() {/*
let ps = StringPStream_create(["str": str])
let x = ParserContext()
x.set("X", __subContext__)
return parse(ps, x)?.value() as? FObject
      */},
    },
  ],
});
