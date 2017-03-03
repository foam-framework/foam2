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
  name: 'Repeat0',
  extends: 'foam.swift.parse.parser.ProxyParser',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.parser.Parser',
      required: false,
      name: 'delim',
    },
    {
      class: 'Int',
      name: 'min',
      value: -1,
    },
    {
      class: 'Int',
      name: 'max',
      value: -1,
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
var first = true
var ps = ps
var result: PStream?

var i = 0
while max == -1 || i < max {
  if delim != nil && !first {
    result = delim!.parse(ps, x)
    if result == nil { break }
    ps = result!
  }

  result = delegate.parse(ps, x)
  if result == nil { break }
  ps = result!
  first = false

  i+=1
}

if min != -1 && i < min { return nil }
return ps
      */},
    },
  ]
});
