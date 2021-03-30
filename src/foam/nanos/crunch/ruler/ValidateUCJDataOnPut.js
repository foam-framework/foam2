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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityGrantMode',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;

            boolean isRenewable = ucj.getIsRenewable(); // ucj either expired, in grace period, or in renewal period

            // this should never happen since ucj data should be frozen on pending or approved
            // and data change is a predicate of this rule
            if ( ucj.getStatus() == CapabilityJunctionStatus.PENDING || ucj.getStatus() == CapabilityJunctionStatus.APPROVED )
              return;

            Capability capability = (Capability) ucj.findTargetId(systemX);

            if ( capability.getGrantMode() != CapabilityGrantMode.AUTOMATIC ) return;
            if ( ! isRenewable ) ucj.setStatus(CapabilityJunctionStatus.ACTION_REQUIRED);

            if ( capability.getOf() == null ) {
              ucj.setStatus(CapabilityJunctionStatus.PENDING);
              return;
            }

            FObject data = ucj.getData();

            if ( data == null ) data = capability.getImpliedData(x, ucj);

            if ( data != null ) {
              try {
                Subject subject = ucj.getSubject(x);
                X sourceX = (X) x.put("subject", subject);

                data.validate(sourceX);
                ucj.setStatus(CapabilityJunctionStatus.PENDING);
                ucj.resetRenewalStatus();
              } catch (Throwable e) {
                Logger logger = (Logger) x.get("logger");
                logger.warning("Validation failed", e.getMessage(), ucj.toString());
              }
            }
          }
        }, "validate ucj data on put");
      `
    },
  ]
});
