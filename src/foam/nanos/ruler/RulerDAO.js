/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RulerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    RulerDAO selects all the rules that can be applied to specific dao depending on type of operation(create/update/remove). Selected rules are applied
    in the order specified in rule.priority until all are executed or until one of the rules forces execution to stop.
    See RulerDAOTest for examples.
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.ReadOnlyDAOContext',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.order.Desc',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.GroupBy',
    'foam.util.SafetyUtil',
    'java.util.List',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  constants: {
    PUT_CMD: 'PUT_CMD'
  },

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'The dao name that rule needs to be applied on.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'createBefore',
      javaFactory: `return AND(
  OR(
    EQ(Rule.OPERATION, Operations.CREATE),
    EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
  ),
  EQ(Rule.AFTER, false)
);`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'createAfter',
      javaFactory: `return AND(
  OR(
    EQ(Rule.OPERATION, Operations.CREATE),
    EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
  ),
  EQ(Rule.AFTER, true)
);`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'updateBefore',
      javaFactory: `return AND(
  OR(
    EQ(Rule.OPERATION, Operations.UPDATE),
    EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
  ),
  EQ(Rule.AFTER, false)
);`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'updateAfter',
      javaFactory: `return AND(
  OR(
    EQ(Rule.OPERATION, Operations.UPDATE),
    EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
  ),
  EQ(Rule.AFTER, true)
);`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'removeBefore',
      javaFactory: `return AND(
  EQ(Rule.OPERATION, Operations.REMOVE),
  EQ(Rule.AFTER, false)
);`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'removeAfter',
      javaFactory: `return AND(
  EQ(Rule.OPERATION, Operations.REMOVE),
  EQ(Rule.AFTER, true)
);`
    },
    {
      class: 'Map',
      name: 'rulesList',
      javaFactory: `return new java.util.HashMap<Predicate, GroupBy>();`
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `FObject oldObj = getDelegate().find_(x, obj);
Map rulesList = getRulesList();
if ( oldObj == null ) {
  applyRules(x, obj, oldObj, (GroupBy) rulesList.get(getCreateBefore()));
} else {
  applyRules(x, obj, oldObj, (GroupBy) rulesList.get(getUpdateBefore()));
}
FObject ret =  getDelegate().put_(x, obj);
if ( oldObj == null ) {
  applyRules(x, ret, oldObj, (GroupBy) rulesList.get(getCreateAfter()));
} else {
  applyRules(x, ret, oldObj, (GroupBy) rulesList.get(getUpdateAfter()));
}
return ret;`
    },
    {
      name: 'remove_',
      javaCode: `FObject oldObj = getDelegate().find_(x, obj);
applyRules(x, obj, oldObj, (GroupBy) getRulesList().get(getRemoveBefore()));
FObject ret =  getDelegate().remove_(x, obj);
applyRules(x, ret, oldObj, (GroupBy) getRulesList().get(getRemoveAfter()));
return ret;`
    },
    {
      name: 'applyRules',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'oldObj',
          type: 'foam.core.FObject'
        },
        {
          name: 'sink',
          type: 'foam.mlang.sink.GroupBy'
        }
      ],
      javaCode: `
for ( Object key : sink.getGroupKeys() ) {
  RuleGroup rg = (RuleGroup) ((DAO) x.get("ruleGroupDAO")).find(key);
  if ( rg == null ) {
    ((foam.nanos.logger.Logger) x.get("logger")).error("RuleGroup not found.", key);
  } else if ( rg.f(x, obj, oldObj) ) {
    List<Rule> group = ((ArraySink) sink.getGroups().get(key)).getArray();
    if ( ! group.isEmpty() ) {
      new RuleEngine(x, getX(), this).execute(group, obj, oldObj);
    }
  }
}`
    },
    {
      name: 'updateRules',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `DAO ruleDAO = ((DAO) x.get("ruleDAO")).where(
  EQ(Rule.DAO_KEY, getDaoKey())
);
ruleDAO.listen(
  new UpdateRulesListSink.Builder(getX())
    .setDao(this)
    .build()
  , null
);

ruleDAO = ruleDAO.where(
  EQ(Rule.ENABLED, true)
).orderBy(new Desc(Rule.PRIORITY));
ruleDAO.select(new AbstractSink(new ReadOnlyDAOContext(getX())) {
      @Override
      public void put(Object obj, Detachable sub) {
        Rule rule = (Rule) obj;
        rule.setX(getX());
      }
    });
addRuleList(ruleDAO, getCreateBefore());
addRuleList(ruleDAO, getUpdateBefore());
addRuleList(ruleDAO, getRemoveBefore());
addRuleList(ruleDAO, getCreateAfter());
addRuleList(ruleDAO, getUpdateAfter());
addRuleList(ruleDAO, getRemoveAfter());`
    },
    {
      name: 'cmd_',
      javaCode: `if ( PUT_CMD == obj ) {
  getDelegate().put((FObject) x.get("OBJ"));
  return true;
}
if ( ! ( obj instanceof RulerProbe ) ) return getDelegate().cmd_(x, obj);
  RulerProbe probe = (RulerProbe) obj;
  switch ( probe.getOperation() ) {
    case UPDATE :
    probeRules(x, probe, getUpdateBefore());
      break;
    case CREATE :
      probeRules(x, probe, getCreateBefore());
      break;
    case REMOVE :
      probeRules(x, probe, getRemoveBefore());
      break;
    default :
      throw new RuntimeException("Unsupported operation type " + probe.getOperation() + " on dao.cmd(RulerProbe)");
    }
    return probe;`
    },
    {
      name: 'probeRules',
      args: [
        { name: 'x', type: 'X' },
        { name: 'probe', type: 'RulerProbe' },
        { name: 'predicate', type: 'foam.mlang.predicate.Predicate' }
      ],
      javaCode: `GroupBy groups;
RuleEngine engine = new RuleEngine(x, getX(), this);
Map rulesList = getRulesList();
FObject oldObj = getDelegate().find_(x, probe.getObject());
groups = (GroupBy) rulesList.get(predicate);
for ( Object key : groups.getGroupKeys() ) {
  List<Rule> rules = ((ArraySink)(groups.getGroups().get(key))).getArray();
  engine.probe(rules, probe, (FObject)probe.getObject(), oldObj);
}`
    },
    {
      name: 'addRuleList',
      args: [
        {
          name: 'dao',
          type: 'foam.dao.DAO'
        },
        {
          name: 'predicate',
          type: 'foam.mlang.predicate.Predicate'
        }
      ],
      javaCode: `getRulesList().put(
     predicate,
     dao.where(predicate)
       .select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()))
   );`
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
    public RulerDAO(foam.core.X x, foam.dao.DAO delegate, String serviceName) {
      setX(x);
      setDelegate(delegate);
      setDaoKey(serviceName);
      updateRules(x);
    }
      `
         );
      }
    }
  ]
});
