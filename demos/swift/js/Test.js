/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
      name: 'id',
      hidden: true,
      swiftExpressionArgs: ['firstName'],
      swiftExpression: 'return firstName',
    },
    {
      name: 'anyProp',
    },
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
myListener()
      */},
    },
  ],
  methods: [
    {
      name: 'methodWithAnArgAndReturn',
      swiftReturns: 'String',
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
myListener()
      */},
    },
  ],
});
