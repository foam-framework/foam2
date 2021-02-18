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
    'foam.nanos.auth.ServiceProviderAwareSupport',
    'foam.util.SafetyUtil',
    'java.util.stream.Collectors',
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

// Clone and pass unfrozen object to 'sync' 'after' rules so, similar
// to 'before' rules, the rule is not responsible for put'ing
// and the updated object is properly passed on to the next rule.
// If the object was modified in an 'after' rule, then it is 'put'.
FObject ret =  getDelegate().put_(x, obj);
if ( ret != null ) {
  ret = ret.fclone();
  FObject before = ret.fclone();
  if ( oldObj == null ) {
    applyRules(x, ret, oldObj, (GroupBy) rulesList.get(getCreateAfter()));
  } else {
    applyRules(x, ret, oldObj, (GroupBy) rulesList.get(getUpdateAfter()));
  }

  // Test for changes during 'after' rule
  if ( before.diff(ret).size() > 0 ) {
    ret = getDelegate().put_(x, ret);
  }
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
    var rules = enforceSpid(x, obj, group);
    if ( ! rules.isEmpty() ) {
      new RuleEngine(x, getX(), this).execute(rules, obj, oldObj);
    }
  }
}`
    },
    {
      name: 'enforceSpid',
      type: 'List<Rule>',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' },
        { name: 'rules', type: 'List<Rule>' }
      ],
      javaCode: `
        return rules.stream()
          .filter(rule -> rule.isGlobalSpid() || isSpidMatched(x, rule, obj))
          .collect(Collectors.toList());
      `
    },
    {
      name: 'isSpidMatched',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'rule', type: 'Rule' },
        { name: 'obj', type: 'FObject' }
      ],
      documentation: 'Send a ServiceProviderAwareSupport action command to the DAO for spid matching test.',
      javaCode: `
        var result = getDelegate().cmd_(x.put("OBJ", obj),
          new ServiceProviderAwareSupport(rule.getSpid()));
        return result instanceof Boolean ? (boolean) result : true;
      `
    },
    {
      name: 'updateRules',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `DAO localRuleDAO = new foam.dao.ProxyDAO(x,
  getDaoKey().equals("localRuleDAO") ? this : (DAO) x.get("localRuleDAO")
).where( EQ(Rule.DAO_KEY, getDaoKey()) );

localRuleDAO.listen(
  new UpdateRulesListSink.Builder(getX())
    .setDao(this)
    .build()
  , null
);

localRuleDAO = localRuleDAO.where(
  EQ(Rule.ENABLED, true)
).orderBy(new Desc(Rule.PRIORITY));
localRuleDAO.select(new AbstractSink(new ReadOnlyDAOContext(getX())) {
      @Override
      public void put(Object obj, Detachable sub) {
        Rule rule = (Rule) obj;
        rule.setX(getX());
      }
    });
addRuleList(localRuleDAO, getCreateBefore());
addRuleList(localRuleDAO, getUpdateBefore());
addRuleList(localRuleDAO, getRemoveBefore());
addRuleList(localRuleDAO, getCreateAfter());
addRuleList(localRuleDAO, getUpdateAfter());
addRuleList(localRuleDAO, getRemoveAfter());`
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
      // This doesn't get called when using Builder,
      //   it must be called manually in this case.
      updateRules(x);
    }
      `
         );
      }
    }
  ]
});
