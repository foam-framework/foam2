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
    'foam.core.X',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.core.FObject'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            Capability capability = (Capability) ucj.findTargetId(x);

            boolean wasApproved = ucj.getStatus() == CapabilityJunctionStatus.APPROVED;

            ucj.setStatus(CapabilityJunctionStatus.ACTION_REQUIRED);

            if ( capability.getOf() == null ) {
              ucj.setStatus(wasApproved ? CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING);
              return;
            }

            FObject data = ucj.getData();
            if ( data != null ) {
              try {
                data.validate(x);
              } catch (IllegalStateException e) {
                return;
              }
              ucj.setStatus(wasApproved ? CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING);
            }
          }
        }, "validate ucj data on put");
      `
    },
  ]
});