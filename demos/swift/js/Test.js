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
  name: 'Test',
  requires: [
    'somepackage.RequiredClass',
  ],
  imports: [
    'testImport',
    'testImport2 as testImportTwo',
  ],
  exports: [
    'firstName',
  ],
  messages: [
    {
      name: 'greeting',
      message: 'Hello there ${first} ${last}',
      description: 'Greeting where ${last} is last name and ${first} is first.',
    }
  ],
  properties: [
    {
      class: 'String',
      name: 'exprProp',
      swiftExpressionArgs: ['firstName', 'lastName'],
      swiftExpression: function() {/*
return firstName + " " + lastName
      */},
    },
    {
      class: 'Int',
      name: 'intProp',
    },
    {
      class: 'Boolean',
      name: 'boolProp',
    },
    {
      class: 'String',
      name: 'prevFirstName',
    },
    {
      class: 'String',
      name: 'prevLastName',
    },
    {
      class: 'String',
      name: 'firstName',
      value: 'John',
      swiftPreSet: function() {/*
self.prevFirstName = oldValue as? String ?? ""
return newValue
      */},
    },
    {
      class: 'String',
      name: 'lastName',
      value: 'Smith',
      swiftPostSet: 'self.prevLastName = oldValue as? String ?? ""'
    },
    {
      name: 'factoryProp',
      swiftFactory: function() {/*
return ["Hello", "World"]
      */},
    },
  ],
  actions: [
    {
      name: 'swapFirstAndLast',
      swiftCode: function() {/*
let firstName = self.firstName
self.firstName = self.lastName
self.lastName = firstName
      */},
    },
    {
      name: 'startLogger',
      swiftCode: function() {/*
myListener(Subscription(detach: {}), [])
      */},
    },
  ],
  methods: [
    {
      name: 'methodWithAnArgAndReturn',
      swiftReturnType: 'String',
      args: [
        {
          name: 'name',
          swiftType: 'String',
        },
      ],
      swiftCode: function() {/*
return String(format: type(of: self).greeting, name, "LASTNAME")
      */},
    }
  ],
  listeners: [
    {
      name: 'myListener',
      isMerged: true,
      mergeDelay: 500,
      swiftCode: function() {/*
NSLog("Hey")
myListener(sub, args)
      */},
    },
  ],
});
