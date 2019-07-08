foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'RemoveJunctionsOnUserRemoval',

  documentation: 'rule to remove any user-capability relationships when a user is removed',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    
    
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      final Long userId = ((User) obj).getId();

      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          ((DAO) x.get("userCapabilityJunctionDAO"))
            .where(EQ(UserCapabilityJunction.SOURCE_ID, userId))
            .removeAll();
        }
      });
      `
    }
  ]
});