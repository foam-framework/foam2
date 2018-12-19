/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.refines',
  name: 'ExprPropertySwiftRefinement',
  refines: 'foam.mlang.ExprProperty',
  flags: ['swift'],
  properties: [
    {
      name: 'swiftAdapt',
      value: `
if let newValue = newValue as? foam_mlang_Expr { return newValue }
return Context.GLOBAL.create(foam_mlang_Constant.self, args: ["value": newValue])!
      `,
    },
  ],
});
