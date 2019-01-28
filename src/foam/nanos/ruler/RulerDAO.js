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
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'The dao name that rule needs to be applied on.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      Operations operation;
      if ( oldObj == null ) {
        operation = Operations.CREATE;
      } else {
        operation = Operations.UPDATE;
      }

      Predicate before = AND(
        OR(
          EQ(Rule.OPERATION, operation),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      );

      applyRules(x, obj, oldObj, before);

      FObject ret =  getDelegate().put_(x, obj);

      Predicate after = AND(
        OR(
          EQ(Rule.OPERATION, operation),
          EQ(Rule.OPERATION, Operations.CREATE_OR_UPDATE)
        ),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, true)
      );

      applyRules(x, ret, oldObj, after);
      return ret;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      FObject oldObj = getDelegate().find_(x, obj);
      Predicate before = AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      );

      applyRules(x, obj, oldObj, before);

      FObject ret =  getDelegate().put_(x, obj);

      Predicate after = AND(
        EQ(Rule.OPERATION, Operations.REMOVE),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, true)
      );

      applyRules(x, ret, oldObj, after);
      return ret;
      `
    },
    {
      name: 'applyRules',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        },
        {
          name: 'oldObj',
          of: 'foam.core.FObject'
        },
        {
          name: 'predicate',
          of: 'Predicate'
        }
      ],
      javaCode: `
      DAO ruleDAO = (DAO) x.get("ruleDAO");

      GroupBy sink = (GroupBy) ruleDAO.where(predicate)
      .orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));

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
        `);
      }
    }
  ]
});
