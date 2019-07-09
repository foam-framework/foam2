/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UpdateJunctionStatusOnDeprecatedCapabilityPut',

  documentation: 'Set the status of usercapabilityjunctions to DEPRECATED when a capability is deprecated by another',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      String deprecatedId = ((CapabilityCapabilityJunction) obj).getSourceId();

      DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

      List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
        .where(EQ(UserCapabilityJunction.TARGET_ID, (String) deprecatedId))
        .select(new ArraySink()))
        .getArray();

      for ( UserCapabilityJunction ucJunction : userCapabilityJunctions ) {
        final UserCapabilityJunction j = (UserCapabilityJunction) ucJunction.fclone();
        j.setStatus(CapabilityJunctionStatus.DEPRECATED);
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ((DAO) x.get("userCapabilityJunctionDAO")).put(j);
          }
        });
      }
      `
    }
  ]
});