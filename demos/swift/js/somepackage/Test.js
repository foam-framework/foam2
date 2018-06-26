/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'Test',
  package: 'somepackage',
  requires: [
    'somepackage.RequiredClass',
  ],
  imports: [
    'testImport?',
    'testImport2? as testImportTwo',
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
      expression: function(firstName) { return firstName },
    },
    {
      class: 'String',
      name: 'description',
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
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'prevLastName',
      visibility: 'RO',
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
    {
      class: 'Enum',
      of: 'foam.u2.Visibility',
      name: 'enumProp',
    },
    {
      class: 'DateTime',
      name: 'dateProp',
    },
  ],
  actions: [
    {
      name: 'swapFirstAndLast',
      code: function() {},
      swiftCode: function() {/*
let firstName = self.firstName
self.firstName = self.lastName
self.lastName = firstName
      */},
    },
    {
      name: 'startLogger',
      code: function() {},
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
      code: function() {},
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
      code: function() {},
      swiftCode: function() {/*
NSLog("Hey")
myListener()
      */},
    },
  ],
});
