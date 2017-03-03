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
  // TODO: We should be able to auto generate all of this.
  name: 'ProxyParser',
  extends: 'foam.swift.parse.parser.Parser',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.parse.parser.Parser',
      required: true,
      name: 'delegate',
    },
  ],
  methods: [
    {
      name: 'parse',
      swiftCode: function() {/*
return delegate.parse(ps, x)
      */},
    },
  ]
});
