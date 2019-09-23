foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'CompositeRuleAction',

  documentation: 'runs multiple rule actions from one action',

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
        for( RuleAction action : getRuleActions() ) {
          action.applyAction(x,obj,oldObj,ruler,agency);
        }
      `
    }
  ]
});
