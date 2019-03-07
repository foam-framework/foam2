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
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.order.Desc',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.GroupBy',
    'java.util.List',
    'static foam.mlang.MLang.*',
    'foam.dao.Sink'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'The dao name that rule needs to be applied on.'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'beforeDao',
      javaFactory: `
        return ((DAO) getX().get("ruleDAO")).where(AND(
          EQ(Rule.DAO_KEY, getDaoKey()),
          EQ(Rule.AFTER, false),
          EQ(Rule.ENABLED, true)
        )).orderBy(new Desc(Rule.PRIORITY));
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'afterDao',
      javaFactory: `
        return ((DAO) getX().get("ruleDAO")).where(AND(
          EQ(Rule.DAO_KEY, getDaoKey()),
          EQ(Rule.AFTER, true),
          EQ(Rule.ENABLED, true)
        )).orderBy(new Desc(Rule.PRIORITY));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      applyRules(x, obj, oldObj,
        getBeforeGroup( oldObj == null ? Operations.CREATE : Operations.UPDATE
          , Operations.CREATE_OR_UPDATE
      ));

      FObject ret =  getDelegate().put_(x, obj);

      applyRules(x, obj, oldObj,
        getAfterGroup( oldObj == null ? Operations.CREATE : Operations.UPDATE
          , Operations.CREATE_OR_UPDATE
      ));
      return ret;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      applyRules(x, obj, oldObj, getBeforeGroup(Operations.REMOVE));

      FObject ret =  getDelegate().remove_(x, obj);

      applyRules(x, ret, oldObj, getAfterGroup(Operations.REMOVE));
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
          new RuleEngine(x, getDelegate()).execute(group, obj, oldObj);
        }
      }
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
          }

          private GroupBy getBeforeGroup(Operations... args) {
            return (GroupBy) getBeforeDao().where(
              IN(Rule.OPERATION, args)
            ).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
          }

          private GroupBy getAfterGroup(Operations... args) {
            return (GroupBy) getAfterDao().where(
              IN(Rule.OPERATION, args)
            ).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
          }
        `);
      }
    }
  ]
});
