/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    RuleDAO selects all the rules that can be applied to specific dao depending on type of operation(create/update/remove). Selected rules are applied
    in the order specified in rule.priority until all are executed or until one of the rules forces execution to stop.
  `,

  javaImports: [
    'foam.mlang.order.Desc',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.mlang.sink.GroupBy',
    'foam.core.FObject'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'daoKey',
      documentation: 'the dao name that rules need to be applied against.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      DAO service = (DAO) x.get(getDaoKey());
      if ( service == null ) {
        throw new RuntimeException("dao with the name " + getDaoKey() + " was not found");
      }

      Operations operation;
      if ( service.find_(x, obj) == null ) {
        operation = Operations.CREATE;
      } else {
        operation = Operations.UPDATE;
      }

      applyRules(x, obj, operation, false);

      FObject ret =  getDelegate().put_(x, obj);

      applyRules(x, ret, operation, true);

      return ret;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      DAO service = (DAO) x.get(getDaoKey());

      if ( service == null ) {
        throw new RuntimeException("dao with the name " + getDaoKey() + " was not found");
      }
      applyRules(x, obj, Operations.REMOVE, false);

      FObject ret =  getDelegate().put_(x, obj);

      applyRules(x, ret, Operations.REMOVE, true);

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
          name: 'operation',
          of: 'Operations'
        },
        {
          name: 'after',
          class: 'Boolean'
        }
      ],
      javaCode: `
      DAO ruleDAO = (DAO) x.get("ruleDAO");

      GroupBy sink = (GroupBy) ruleDAO.where(AND(
        EQ(Rule.OPERATION, operation),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, after)
      )).orderBy(new Desc(Rule.PRIORITY)).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));

      for ( Object key : sink.getGroupKeys() ) {
        List<Rule> groups = ((ArraySink) sink.getGroups().get(key)).getArray();
        for ( Rule rule : groups ) {
          if ( rule.getPredicate().f(obj) ) {
            rule.getAction().applyAction(x, obj);
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
         public RuleDAO(foam.core.X x, foam.dao.DAO delegate, String serviceName) {
           setX(x);
           setDelegate(delegate);
           setDaoKey(serviceName);
         }
        `);
      }
    }
  ]
});
