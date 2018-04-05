/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.mlang.AbstractExpr',
  methods: [
    function f() {}
  ]
});

foam.CLASS({
  refines: 'foam.mlang.ExprProperty',
  properties: [
    {
      name: 'swiftType',
      value: 'Any',
    },
    {
      name: 'swiftAdapt',
      value: `
if let newValue = newValue as? FObject { return newValue }
if let newValue = newValue as? PropertyInfo { return newValue }
return Context.GLOBAL.create(Constant.self, args: ["value": newValue])!
      `,
    },
  ],
});

foam.CLASS({
  refines: 'foam.mlang.ArrayConstant',

  methods: [
    {
      name: 'f',
      swiftCode: 'return value'
    }
  ]
});