/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Rule',

  documentation: 'Rule model represents rules(actions) that need to be applied in case passed object satisfies provided predicate.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'Sequence number.'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Rule name for human readability.'
    },
    {
      class: 'Int',
      name: 'priority',
      documentation: 'Priority defines the order in which rules are to be applied.'+
      'Rules with a higher priority are to be applied first.'+
      'The convention for values is ints that are multiple of 10.'
    },
    {
      class: 'Boolean',
      name: 'stops',
      documentation: 'When set to true, the rule prevents execution of the following rules within the same group.'
    },
    {
      class: 'String',
      name: 'ruleGroup',
      documentation: 'ruleGroup defines sets of rules related to the same action.'
    },
    {
      class: 'String',
      name: 'documentation'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
      return foam.mlang.MLang.EQ(true, true);
      `,
      documentation: 'predicate is checked against an object; if returns true, the action is executed.'+
      'Deafaults to return true.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj) {}
      };`,
      documentation: 'The action to be executed if predicates reutns true for passed object.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'daoKey',
      documentation: 'dao name that the rule is applied on.'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      documentation: 'Defines when the rules is to be applied: UPDATE(put), CREATE(put), REMOVE(remove)'
    },
    {
      class: 'Boolean',
      name: 'after',
      documentation: 'Defines if the rule needs to be applied before or after operation is completed'+
      'E.g. on dao.put: before object was stored in a dao or after.'
    }
  ]
});
