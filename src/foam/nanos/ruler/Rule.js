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
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.DirectAgency',
    'foam.nanos.logger.Logger',
    'java.util.Collection'
  ],

  tableColumns: [
    'id',
    'name',
    'ruleGroup',
    'enabled',
    'priority',
    'daoKey',
    'documentation'
  ],

  searchColumns: [
    'id',
    'name',
    'ruleGroup',
    'enabled',
    'priority',
    'daoKey',
    'operation',
    'after',
    'validity'
  ],

  sections: [
    {
      name: 'basicInfo',
      order: 100
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'Sequence number.',
      visibility: 'RO',
      tableWidth: 50
    },
    {
      class: 'String',
      name: 'name',
      section: 'basicInfo',
      documentation: 'Rule name for human readability.',
      tableWidth: 200
    },
    {
      class: 'Int',
      name: 'priority',
      documentation: 'Priority defines the order in which rules are to be applied.'+
      'Rules with a higher priority are to be applied first.'+
      'The convention for values is ints that are multiple of 10.',
      permissionRequired: true,
      tableWidth: 50
    },
    {
      class: 'String',
      name: 'ruleGroup',
      documentation: 'ruleGroup defines sets of rules related to the same action.',
      permissionRequired: true,
      tableWidth: 100
    },
    {
      class: 'String',
      name: 'documentation',
      permissionRequired: true,
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12, cols: 80
      }
    },
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'dao name that the rule is applied on.',
      permissionRequired: true,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Services',
              dao: X.nSpecDAO.where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
            }
          ]
        };
      },
      tableWidth: 125
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      permissionRequired: true,
      documentation: 'Defines when the rules is to be applied: put/removed'
    },
    {
      class: 'Boolean',
      name: 'after',
      permissionRequired: true,
      documentation: 'Defines if the rule needs to be applied before or after operation is completed'+
      'E.g. on dao.put: before object was stored in a dao or after.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      // TODO make a friendlier view.
      view: { class: 'foam.u2.view.JSONTextView' },
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
      hidden: true,
      documentation: 'The action to be executed if predicates returns true for passed object.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'asyncAction',
      hidden: true,
      documentation: 'The action to be executed asynchronously if predicates returns true for passed object.'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      documentation: 'Enables the rule.',
      permissionRequired: true,
      tableWidth: 50
    },
    {
      class: 'Boolean',
      name: 'saveHistory',
      value: false,
      permissionRequired: true,
      documentation: 'Determines if history of rule execution should be saved.',
      help: 'Automatically sets to true when validity is greater than zero.',
      adapt: function(_, nu) {
        return nu || this.validity > 0;
      }
    },
    {
      class: 'Int',
      name: 'validity',
      documentation: 'Validity of the rule (in days) for automatic rescheduling.',
      permissionRequired: true,
      postSet: function(_, nu) {
        if ( nu > 0
          && ! this.saveHistory
        ) {
          this.saveHistory = true;
        }
      }
    },
    {
      class: 'Object',
      name: 'cmd',
      transient: true,
      hidden: true,
      javaFactory: `
        if ( Operations.CREATE == getOperation()
          || Operations.UPDATE == getOperation()
          || Operations.CREATE_OR_UPDATE == getOperation()
        ) {
          return RulerDAO.PUT_CMD;
        }
        return null;
      `
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
        try {
          return getEnabled()
            && getPredicate().f(
              x.put("NEW", obj).put("OLD", oldObj)
            );
        } catch ( Throwable t ) {
          try {
            return getPredicate().f(obj);
          } catch ( Throwable th ) { }

          ((Logger) x.get("logger")).error(
            "Failed to evaluate predicate of rule: " + getId(), t);
          return false;
        }
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
        },
        {
          name: 'agency',
          type: 'foam.core.Agency'
        }
      ],
      javaCode: `
        getAction().applyAction(x, obj, oldObj, ruler, agency);
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
        getAsyncAction().applyAction(x, obj, oldObj, ruler, new DirectAgency());
        if ( ! getAfter() ) {
          ruler.getDelegate().cmd_(x.put("OBJ", obj), getCmd());
        }
      `
    },
    {
      name: 'updateRule',
      type: 'foam.nanos.ruler.Rule',
      documentation: 'since rules are stored as lists in the RulerDAO we use listeners to update them whenever ruleDAO is updated.' +
      'the method provides logic for modifying already stored rule. If not overridden, the incoming rule will be stored in the list as it is.',
      args: [
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        }
      ],
      javaCode: `
      return rule;`
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public static Rule findById(Collection<Rule> listRule, Long passedId) {
          return listRule.stream().filter(rule -> passedId.equals(rule.getId())).findFirst().orElse(null);
      }
      public void setX(X x) {
        super.setX(x);
        if ( getAction() instanceof ContextAware ) {
          ((ContextAware)getAction()).setX(x);
        }
        if ( getAsyncAction() instanceof ContextAware ) {
          ((ContextAware)getAsyncAction()).setX(x);
        }
      }
        `);
      }
    }
  ]
});
