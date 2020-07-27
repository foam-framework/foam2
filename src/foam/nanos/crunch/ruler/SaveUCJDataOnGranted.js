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

            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) throw new RuntimeException("Data not saved to target object: Capability not found.");

            if ( capability.getOf() != null && capability.getDaoKey() != null ) ucj.saveDataToDAO(x, capability, true);
          }
        }, "");
      `
    }
  ]
});