/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.mlang.AbstractExpr',
  flags: ['swift'],
  methods: [
    function f() {}
  ]
});

foam.CLASS({
  refines: 'foam.mlang.ExprProperty',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftType',
      value: 'Any',
    },
    {
      name: 'swiftAdapt',
      value: `
if let newValue = newValue as? foam_mlang_Expr { return newValue }
return Context.GLOBAL.create(foam_mlang_Constant.self, args: ["value": newValue])!
      `,
    },
  ],
});

foam.CLASS({
  refines: 'foam.mlang.ArrayConstant',
  flags: ['swift'],

  methods: [
    {
      name: 'f',
      swiftCode: 'return value'
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.sink.Map',
  flags: ['swift'],

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          swiftType: 'Any?'
        }
      ],
      swiftReturns: 'Any?',
      swiftCode: `return (arg1 as? foam_mlang_Expr)?.f(obj)`
    },
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          swiftType: 'Any'
        },
        {
          name: 'sub',
          swiftType: 'Detachable'
        }
      ],
      swiftReturns: 'Void',
      swiftCode: `delegate.put(f(obj)!, sub)`

    }
  ]
});
