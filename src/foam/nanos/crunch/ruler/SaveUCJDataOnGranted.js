/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'SaveUCJDataOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Long effectiveUser = ( ucj instanceof AgentCapabilityJunction ) ? ((AgentCapabilityJunction) ucj).getEffectiveUser() : null;
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
              EQ(UserCapabilityJunction.TARGET_ID, ucj.getTargetId()),
              OR(
                NOT(INSTANCE_OF(foam.nanos.crunch.AgentCapabilityJunction.class)),
                EQ(AgentCapabilityJunction.EFFECTIVE_USER, effectiveUser)
              )
            ));

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getIsRenewable()
              || ( old != null && ! old.getIsRenewable() && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) 
              return;

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) throw new RuntimeException("Data not saved to target object: Capability not found.");

            if ( capability.getOf() != null && capability.getDaoKey() != null ) ucj.saveDataToDAO(x, capability, true);
          }
        }, "");
      `
    }
  ]
});
