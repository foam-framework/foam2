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
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'createBefore'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'createAfter'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'updateBefore'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'updateAfter'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'removeBefore'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.sink.GroupBy',
      name: 'removeAfter'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      if ( oldObj == null ) {
        applyRules(x, obj, oldObj, getCreateBefore());
      } else {
        applyRules(x, obj, oldObj, getUpdateBefore());
      }

      FObject ret =  getDelegate().put_(x, obj);

      if ( oldObj == null ) {
        applyRules(x, obj, oldObj, getCreateAfter());
      } else {
        applyRules(x, obj, oldObj, getUpdateAfter());
      }
      return ret;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      applyRules(x, obj, oldObj, getRemoveBefore());

      FObject ret =  getDelegate().put_(x, obj);

      applyRules(x, ret, oldObj, getRemoveAfter());
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
        List<Rule> groups = ((ArraySink) sink.getGroups().get(key)).getArray();
        for ( Rule rule : groups ) {
          if ( rule.getPredicate().f(obj) ) {
            rule.getAction().applyAction(x, obj, oldObj);
            if ( rule.getStops() ) {
              break;
            }
          }
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
      javaCode: `
      DAO ruleDAO = (DAO) x.get("ruleDAO");
      GroupBy createdBefore = (GroupBy) ruleDAO.where(AND(
        OR(
          EQ(Rule.OPERATION, Operations.CREATE),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setCreateBefore(createdBefore);

      GroupBy updatedBefore = (GroupBy) ruleDAO.where(AND(
        OR(
          EQ(Rule.OPERATION, Operations.UPDATE),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setUpdateBefore(updatedBefore);

      GroupBy createdAfter = (GroupBy) ruleDAO.where(AND(
        OR(
          EQ(Rule.OPERATION, Operations.CREATE),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, true)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setCreateAfter(createdAfter);

      GroupBy updatedAfter = (GroupBy) ruleDAO.where(AND(
        OR(
          EQ(Rule.OPERATION, Operations.CREATE),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, true)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setUpdateAfter(updatedAfter);

      GroupBy removedBefore = (GroupBy) ruleDAO.where(AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setRemoveBefore(removedBefore);

      GroupBy removedAfter = (GroupBy) ruleDAO.where(AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, true)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
      setRemoveAfter(removedAfter);
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
