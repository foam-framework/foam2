foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    RuleDAO finds all the rules that can be applied to specific daoKey and executes actions on each
  `,

  javaImports: [
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
      name: 'daoKey'
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
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
      applyRules(x, obj, operation, true);
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
      applyRules(x, obj, Operations.REMOVE, true);
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
      )).orderBy(Rule.PRIORITY).select(GROUP_BY(Rule.RULE_GROUP, new ArraySink()));
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
