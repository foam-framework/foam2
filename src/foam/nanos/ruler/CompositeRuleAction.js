/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'CompositeRuleAction',

  documentation: 'Runs multiple rule actions from one action. Completes actions sequentially in array, and actions stack.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.ruler.RuleAction',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'ruleActions'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        for ( RuleAction action : getRuleActions() ) {
          action.applyAction(x, obj, oldObj, ruler, rule, agency);
        }
      `
    }
  ]
});
