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
  package: 'foam.swift.parse.parser',
  name: 'Literal',
  extends: 'foam.swift.parse.parser.Parser',
  properties: [
    {
      class: 'String',
      name: 'string',
    },
    {
      name: 'value',
      swiftExpressionArgs: ['string'],
      swiftExpression: 'return string'
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps
for i in 0..<string.characters.count {
  if !ps.valid() || ps.head() != string.char(at: i) {
    return nil
  }
  ps = ps.tail()
}
return ps.setValue(self.value)
      */},
    },
  ]
});
