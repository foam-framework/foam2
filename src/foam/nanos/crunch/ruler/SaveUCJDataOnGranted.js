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
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.core.FObject',
    'foam.nanos.logger.Logger',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.crunch.CapabilityJunctionStatus'
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
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
              EQ(UserCapabilityJunction.TARGET_ID, ucj.getTargetId())
            ));

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || old.getStatus() == CapabilityJunctionStatus.GRANTED ) return;

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) throw new RuntimeException("Data not saved to target object: Capability not found.");

            if ( capability.getOf() != null && capability.getDaoKey() != null ) ucj.saveDataToDAO(x, capability, true);
          }
        }, "");
      `
    }
  ]
});