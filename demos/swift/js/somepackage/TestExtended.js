/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'TestExtended',
  package: 'somepackage',
  extends: 'somepackage.Test',
  properties: [
    {
      class: 'String',
      name: 'firstName',
      value: 'John',
      swiftPreSet: function() {/*
return newValue + "EXTENDED"
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
return String(format: type(of: self).greeting, name, "OVERRIDE!!!")
      */},
    }
  ]
});
