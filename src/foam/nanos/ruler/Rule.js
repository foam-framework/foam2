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
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
      return foam.mlang.MLang.TRUE;
      `,
      documentation: 'predicate is checked against an object; if returns true, the action is executed.'+
      'Defaults to return true.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) { /*noop*/ }
      };`,
      documentation: 'The action to be executed if predicates returns true for passed object.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'asyncAction',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj, FObject oldObj, RuleEngine ruler) { /*noop*/ }
      };`,
      documentation: 'The action to be executed asynchronously if predicates returns true for passed object.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      documentation: 'Enables the rule.'
    },
    {
      class: 'Boolean',
      name: 'saveHistory',
      value: false,
      documentation: 'Determines if history of rule execution should be saved.'
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        }
      ],
      javaCode: `
        return getPredicate().f(
          x.put("NEW", obj).put("OLD", oldObj)
        );
      `
    },
    {
      name: 'apply',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        },
        {
          name: 'ruler',
          type: 'foam.nanos.ruler.RuleEngine'
        }
      ],
      javaCode: `
        getAction().applyAction(x, obj, oldObj, ruler);
      `
    },
    {
      name: 'asyncApply',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'oldObj',
          type: 'FObject'
        },
        {
          name: 'ruler',
          type: 'foam.nanos.ruler.RuleEngine'
        }
      ],
      javaCode: `
        getAsyncAction().applyAction(x, obj, oldObj, ruler);
        if ( ! getAfter()
          && Operations.CREATE == getOperation()
          || Operations.UPDATE == getOperation()
          || Operations.CREATE_OR_UPDATE == getOperation()
        ) {
          ruler.getDelegate().put_(x, obj);
        }
      `
    }
  ]
});
