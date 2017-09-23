/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.box',
  name: 'BoxRegistry',
  methods: [
    {
      name: 'doLookup',
      returns: 'foam.box.Box',
      javaReturns: 'foam.box.Box',
      swiftThrows: true,
      args: [
        {
          class: 'String',
          name: 'name',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'register',
      returns: 'foam.box.Box',
      javaReturns: 'foam.box.Box',
      args: [
        {
          name: 'name',
          swiftClass: 'String?',
          javaType: 'String'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.BoxService',
          name: 'service',
          javaType: 'foam.box.BoxService'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.box.Box',
          required: true,
          name: 'box',
          javaType: 'foam.box.Box'
        }
      ],
    },
    {
      name: 'unregister',
      returns: '',
      javaReturns: 'void',
      args: [
        {
          name: 'name',
          javaType: 'String'
        }
      ]
    }
  ]
});
