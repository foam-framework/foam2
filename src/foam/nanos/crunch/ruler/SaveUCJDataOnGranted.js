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
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Logger logger = (Logger) x.get("logger");
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
            logger.debug(this.getClass().getSimpleName(), "ucj ", ucj);
            logger.debug(this.getClass().getSimpleName(), "old ", old);

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getIsRenewable() ) return;
            if ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && ! old.getIsRenewable() && 
              ( ( old.getData() == null && ucj.getData() == null ) || old.getData().equals(ucj.getData()) ) 
            ) return;

            Capability capability = (Capability) ucj.findTargetId(x);
            logger.debug(this.getClass().getSimpleName(), "ucj.findTargetId(x) - capability ", capability);
            if ( capability == null ) throw new RuntimeException("Data not saved to target object: Capability not found.");

            foam.core.FObject obj = null;
            if ( capability.getOf() != null && capability.getDaoKey() != null ) obj = (foam.core.FObject) ucj.saveDataToDAO(x, capability, true);
            if ( obj instanceof foam.nanos.auth.User ) {
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - subject", x.get("subject"));
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - user", ((foam.nanos.auth.Subject) x.get("subject")).getUser());
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - realuser", ((foam.nanos.auth.Subject) x.get("subject")).getRealUser());
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - capability", capability);
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - ucj", ucj);
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - data", ucj.getData());
              logger.debug(this.getClass().getSimpleName(), "ucj.saveDataToDAO(x, "+capability.getId()+", true). - savedObj", obj);
            }
          }
        }, "");
      `
    }
  ]
});
