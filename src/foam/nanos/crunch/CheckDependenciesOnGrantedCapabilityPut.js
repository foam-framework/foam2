foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CheckDependenciesOnGrantedCapabilityPut',

  documentation: 'rule to update any capabilities depending on current capability as prerequisite if the current capability is set to GRANTED',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'java.util.List',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.*',
    
    
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
      DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

      String capId = (String) ((UserCapabilityJunction) obj).getTargetId();
      Long userId = ((UserCapabilityJunction) obj).getSourceId();

      List<UserCapabilityJunction> pendingJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
      .where(AND(
        EQ(UserCapabilityJunction.SOURCE_ID, userId),
        EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.PENDING),
        NEQ(UserCapabilityJunction.TARGET_ID, capId)
      ))
      .select(new ArraySink()))
      .getArray();
      for(UserCapabilityJunction pendingJunction : pendingJunctions) {
        final CapabilityCapabilityJunction prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.find(
          AND(
            EQ(CapabilityCapabilityJunction.SOURCE_ID, capId),
            EQ(CapabilityCapabilityJunction.TARGET_ID, (String) pendingJunction.getTargetId())
          )
        );
        if(prereqJunction != null) {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              ((DAO) x.get("userCapabilityJunctionDAO")).put((UserCapabilityJunction) pendingJunction.fclone());
            }
          });
        }
      }
      `
    }
  ]
});