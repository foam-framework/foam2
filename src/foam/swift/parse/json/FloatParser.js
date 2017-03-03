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
  name: 'FloatParser',
  extends: 'foam.swift.parse.parser.Parser',
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var ps = ps
var n: [Character] = []
var decimalFound = false

if !ps.valid() { return nil }

var c = ps.head()

if c == "-" {
  n.append(c)
  ps = ps.tail();
  if !ps.valid() { return nil }
  c = ps.head()
}

// Float numbers must start with a digit: 0.1, 4.0
if c.isDigit() { n.append(c) }
else { return nil }

ps = ps.tail()
while ps.valid() {
  c = ps.head()
  if c.isDigit() {
    n.append(c)
  } else if c == "." { // TODO: localization
    if decimalFound {
      return nil
    }
    decimalFound = true;
    n.append(c)
  } else {
    break;
  }
  ps = ps.tail()
}


return ps.setValue(n.count > 0 ? Float(String(n)) : nil)
      */},
    },
  ]
});
