foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    RuleDAO finds all the rules that can be applied to specific daoKey and executes actions on each
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ProxyDAO',
    'foam.dao.DAO',
    'foam.nanos.boot.NSpec',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'foam.dao.ArraySink'
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
      NSpec service = (NSpec) x.get(getDaoKey());
      if ( service == null ) {
        throw new RuntimeException("Service with the name " + getDaoKey() + " was not found");
      }
      DAO ruleDAO = (DAO) x.get("ruleDAO");
      List<Rule> rules = ((ArraySink)ruleDAO.where(AND(
        EQ(Rule.ACTION, Operations.CREATE),
        EQ(Rule.DAO_KEY, getDaoKey()),
        EQ(Rule.AFTER, false)
      )).orderBy(Rule.PRIORITY).select(new ArraySink())).getArray();
      for ( Rule rule : rules ) {
        if ( rule.getPredicate().f(obj) ) {
          rule.getAction().execute(x);
          if ( rule.getStops() ) {
            break;
          }
        }
      }
      return getDelegate().put_(x, obj);
      `
    },
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
