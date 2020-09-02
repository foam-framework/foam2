/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'ValidateUCJDataOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
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
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            boolean isRenewable = ucj.getIsRenewable(); // ucj either expired, in grace period, or in renewal period
            
            if ( ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ! isRenewable ) || 
              ucj.getStatus() == CapabilityJunctionStatus.PENDING || 
              ucj.getStatus() == CapabilityJunctionStatus.APPROVED ) 
              return;

            Capability capability = (Capability) ucj.findTargetId(x);

            System.out.println(">>>>>>>>> VALIDATE UCJ DATA ON PUT");
            System.out.println("ucj = " + capability.getName());
            System.out.println("status = " + ucj.getStatus());
            UserCapabilityJunction oldUcj = (UserCapabilityJunction) (((foam.dao.DAO) x.get("bareUserCapabilityJunctionDAO")).find(ucj.getId()));
            System.out.println("olducj = " + (oldUcj == null ? "null" : oldUcj.getStatus()));

            if ( ! isRenewable ) ucj.setStatus(CapabilityJunctionStatus.ACTION_REQUIRED);

            if ( capability.getOf() == null ) {
              ucj.setStatus(CapabilityJunctionStatus.PENDING);
              return;
            }

            FObject data = ucj.getData();
            if ( data != null ) {
              try {
                data.validate(x);
                ucj.setStatus(CapabilityJunctionStatus.PENDING);
                ucj.resetRenewalStatus();
              } catch (IllegalStateException e) {
                Logger logger = (Logger) x.get("logger");
                logger.error("ERROR IN UCJ DATA VALIDATION : ", e);
                return;
              }
            }
          }
        }, "validate ucj data on put");
      `
    },
  ]
});
