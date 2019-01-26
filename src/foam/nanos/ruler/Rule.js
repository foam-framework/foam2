foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'Rule',

  documentation: 'Rule',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.DigitalAccount',
    'foam.core.X',
    'foam.core.FObject'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'ruleGroup'
    },
    {
      class: 'String',
      name: 'documentation'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      javaFactory: `
      return foam.mlang.MLang.EQ(true, true);
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'action',
      javaFactory: `
      return new RuleAction() {
        @Override
        public void applyAction(X x, FObject obj) {}
      };`
    },
    {
      class: 'Int',
      name: 'priority'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'daoKey'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation'
    },
    {
      class: 'Boolean',
      name: 'after'
    },
    {
      class: 'Boolean',
      name: 'stops'
    }
  ]
});
