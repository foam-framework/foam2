/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'AbstractRule',
  abstract: true,

  implements: [
    'foam.nanos.ruler.RuleAction',
    'foam.mlang.predicate.Predicate'
  ],

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
      name: 'documentation',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12, cols: 80
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'daoKey',
      documentation: 'dao name that the rule is applied on.',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      documentation: 'Defines when the rules is to be applied: put/removed'
    },
    {
      class: 'Boolean',
      name: 'after',
      documentation: 'Defines if the rule needs to be applied before or after operation is completed'+
      'E.g. on dao.put: before object was stored in a dao or after.'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: 'return this.f(obj);'
    },
    {
      name: 'applyAction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaCode: ` `
    },
    {
      name: 'prepareStatement',
      javaCode: ' '
    },
    {
      name: 'createStatement',
      type: 'String',
      javaCode: 'return "";'
    },
    {
      name: 'partialEval',
      javaCode: 'return this;',
    },
  ]
});
