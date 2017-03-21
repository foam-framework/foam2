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

foam.INTERFACE({
  package: 'foam.swift.parse',
  name: 'PStream',
  methods: [
    {
      name: 'head',
      swiftReturnType: 'Character',
      swiftEnabled: true,
    },
    {
      name: 'valid',
      swiftReturnType: 'Bool',
      swiftEnabled: true,
    },
    {
      name: 'tail',
      swiftReturnType: 'PStream',
      swiftEnabled: true,
    },
    {
      name: 'substring',
      swiftReturnType: 'String',
      args: [
        {
          name: 'end',
          swiftType: 'PStream',
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'value',
      swiftReturnType: 'Any?',
      swiftEnabled: true,
    },
    {
      name: 'setValue',
      swiftReturnType: 'PStream',
      args: [
        {
          name: 'value',
          swiftType: 'Any?',
        },
      ],
      swiftEnabled: true,
    },
  ]
});
