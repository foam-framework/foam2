/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Rule',

  documentation: 'Rule model represents rules(actions) that need to be applied in case passed object satisfies provided predicate.',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.approval.ApprovableAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'userDAO?'
  ],

  javaImports: [
    'foam.core.DirectAgency',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.logger.Logger',
    'java.util.Collection'
  ],

  tableColumns: [
    'id',
    'name',
    'ruleGroup.id',
    'enabled',
    'priority',
    'daoKey',
    'createdBy.legalName',
    'lastModifiedBy.legalName'
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
      class: 'String',
      name: 'id',
      visibility: 'RO'
      // will display in '_defaultSection'
    },
    {
      class: 'String',
      name: 'name',
      tableWidth: 300,
      section: 'basicInfo'
    },
    {
      class: 'Int',
      name: 'priority',
      documentation: 'Priority defines the order in which rules are to be applied.'+
      'Rules with a higher priority are to be applied first.'+
      'The convention for values is ints that are multiple of 10.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      tableWidth: 66,
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'documentation',
      readPermissionRequired: true,
      writePermissionRequired: true,
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 12, cols: 80
      },
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'daoKey',
      label: 'DAO Key',
      documentation: 'dao name that the rule is applied on.',
      readPermissionRequired: true,
      writePermissionRequired: true,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
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
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Defines when the rules is to be applied: put/removed'
    },
    {
      class: 'Boolean',
      name: 'after',
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Defines if the rule needs to be applied before or after operation is completed'+
      'E.g. on dao.put: before object was stored in a dao or after.'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      factory: function () {
        return foam.mlang.predicate.True.create();
      },
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
      view: { class: 'foam.u2.view.JSONTextView' },
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
      readPermissionRequired: true,
      writePermissionRequired: true,
      tableWidth: 70,
      section: 'basicInfo'
    },
    {
      class: 'Boolean',
      name: 'saveHistory',
      value: false,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: 'Determines if history of rule execution should be saved.',
      help: 'Automatically sets to true when validity is greater than zero.',
      adapt: function(_, nu) {
        return nu || this.validity > 0;
      }
    },
    {
      class: 'Boolean',
      name: 'debug',
      documentation: 'Test this boolean before generating expensive logger.debug calls, to speed rule execution.'
    },
    {
      class: 'Int',
      name: 'validity',
      documentation: 'Validity of the rule (in days) for automatic rescheduling.',
      readPermissionRequired: true,
      writePermissionRequired: true,
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
    },
    {
      class: 'DateTime',
      name: 'created',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      value: foam.nanos.auth.LifecycleState.PENDING,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      readVisibility: 'RO',
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.userfeedback.UserFeedback',
      name: 'userFeedback',
      storageTransient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'checkerPredicate',
      javaFactory: 'return foam.mlang.MLang.FALSE;'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      value: foam.nanos.auth.ServiceProviderAware.GLOBAL_SPID,
      documentation: 'Service Provider Id of the rule. Default to ServiceProviderAware.GLOBAL_SPID for rule applicable to all service providers.'
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
        if ( ! getEnabled() ) return false;

        try {
          return getPredicate().f(x.put("NEW", obj).put("OLD", oldObj));
        } catch ( Throwable t ) {
          try {
            return getPredicate().f(obj);
          } catch ( Throwable th ) { }
          // ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "id", getId(), "\\nrule", this, "\\nobj", obj, "\\nold", oldObj, "\\n", t);
          ((Logger) x.get("logger")).error("Failed to evaluate predicate of rule: " + getId(), t);
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
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        },
        {
          name: 'agency',
          type: 'foam.core.Agency'
        }
      ],
      javaCode: `
        getAction().applyAction(x, obj, oldObj, ruler, rule, agency);
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
        },
        {
          name: 'rule',
          type: 'foam.nanos.ruler.Rule'
        },
      ],
      javaCode: `
        getAsyncAction().applyAction(x, obj, oldObj, ruler, rule, new DirectAgency());
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
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.name || this.id;
      }
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.create") ) {
          throw new AuthorizationException("You do not have permission to create the rule.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.read." + getId())
          && ! auth.check(x, "spid.read." + getSpid())
        ) {
          throw new AuthorizationException("You do not have permission to read the rule.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.update." + getId()) ) {
          throw new AuthorizationException("You do not have permission to update the rule.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        var auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "rule.remove." + getId())
          && ! auth.check(x, "spid.update." + getSpid())
        ) {
          throw new AuthorizationException("You do not have permission to delete the rule.");
        }
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public static Rule findById(Collection<Rule> listRule, String passedId) {
          return listRule.stream().filter(rule -> passedId.equals(rule.getId())).findFirst().orElse(null);
        }
        `);
      }
    }
  ]
});
