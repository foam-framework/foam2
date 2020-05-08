/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.action',
  name: 'ChangePropertyAction',

  documentation: `set the value of a field to the result of an expression`,

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'valueExpr'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        obj.setProperty(getPropName(),getValueExpr().f(x));
      `
    }
  ]
});
