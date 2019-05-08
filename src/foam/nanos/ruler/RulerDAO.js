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
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.GroupBy',
    'java.util.ArrayList',
    'java.util.Collections',
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
      javaFactory: `
      return AND(
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
      javaFactory: `
      return AND(
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
      javaFactory: `
      return AND(
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
      javaFactory: `
      return AND(
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
      javaFactory: `
      return AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.AFTER, false)
      );`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'removeAfter',
      javaFactory: `
      return AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.AFTER, true)
      );`
    },
    {
      class: 'Map',
      name: 'rulesList',
      javaFactory: `
      return new java.util.HashMap<Predicate, GroupBy>();
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
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
      return ret;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      applyRules(x, obj, oldObj, (GroupBy) getRulesList().get(getRemoveBefore()));
      FObject ret =  getDelegate().remove_(x, obj);
      applyRules(x, ret, oldObj, (GroupBy) getRulesList().get(getRemoveAfter()));
      return ret;
      `
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
        List<Rule> group = ((ArraySink) sink.getGroups().get(key)).getArray();
        if ( ! group.isEmpty() ) {
          Collections.sort(group, new foam.mlang.order.Desc(Rule.PRIORITY));
          new RuleEngine(x, this).execute(group, obj, oldObj);
        }
      }
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
      javaCode: `DAO ruleDAO = ((DAO) x.get("ruleDAO")).where(EQ(Rule.DAO_KEY, getDaoKey()));
Map rulesList = getRulesList();
GroupBy createdBefore = (GroupBy) ruleDAO.where(getCreateBefore()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getCreateBefore(), createdBefore);
GroupBy updatedBefore = (GroupBy) ruleDAO.where(getUpdateBefore()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getUpdateBefore(), updatedBefore);
GroupBy createdAfter = (GroupBy) ruleDAO.where(getCreateAfter()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getCreateAfter(), createdAfter);
GroupBy updatedAfter = (GroupBy) ruleDAO.where(getUpdateAfter()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getUpdateAfter(), updatedAfter);
GroupBy removedBefore = (GroupBy) ruleDAO.where(getRemoveBefore()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getRemoveBefore(), removedBefore);
GroupBy removedAfter = (GroupBy) ruleDAO.where(getRemoveAfter()).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
rulesList.put(getRemoveAfter(), removedAfter);

ruleDAO.listen(new AbstractSink() {
  @Override
  public void put(Object obj, Detachable sub) {
    Map rulesList = getRulesList();
    Rule rule = (Rule) obj;
    if ( ! rule.getDaoKey().equals(getDaoKey()) ) {
      return;
    }
    String ruleGroup = rule.getRuleGroup();
    for ( Object key : rulesList.keySet() ) {
      if ( ((Predicate) key).f(obj) ) {
        GroupBy group = (GroupBy) rulesList.get(key);
        if ( group.getGroupKeys().contains(ruleGroup) ) {
          ArrayList rules = (ArrayList) ((ArraySink)group.getGroups().get(ruleGroup)).getArray();
          Rule foundRule = Rule.findById(rules, rule.getId());
          if ( foundRule != null ) {
            rules.remove(foundRule);
            rules.add(foundRule.updateRule(rule));
          } else {
            rules.add(obj);
          }
        } else {
          group.putInGroup_(sub, ruleGroup, obj);
        }
      }
    }
  }
  
  @Override
  public void remove(Object obj, Detachable sub) {
    Map rulesList = getRulesList();
    Rule rule = (Rule) obj;
    if ( rule.getDaoKey() != getDaoKey() ) {
      return;
    }
    String ruleGroup = rule.getRuleGroup();
    for ( Object key : rulesList.keySet() ) {
      if ( ((Predicate) key).f(obj) ) {
        GroupBy group = (GroupBy) rulesList.get(key);
        if ( group.getGroupKeys().contains(ruleGroup) ) {
          ArrayList rules = (ArrayList) ((ArraySink)group.getGroups().get(ruleGroup)).getArray();
          Rule foundRule = Rule.findById(rules, rule.getId());
          if ( foundRule != null ) {
            rules.remove(foundRule);
          }
        }
      }
    }
  }
}, null);
        `
    },
    {
      name: 'cmd_',
      javaCode: `
        if ( PUT_CMD == obj ) {
          getDelegate().put((FObject) x.get("OBJ"));
          return true;
        }
        return getDelegate().cmd(obj);
      `
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
        `);
      }
    }
  ]
});
