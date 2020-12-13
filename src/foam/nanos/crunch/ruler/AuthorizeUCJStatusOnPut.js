/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'AuthorizeUCJStatusOnPut',
  implements: [ 'foam.nanos.ruler.RuleAction' ],
  tags: [ 'security' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.HashMap',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  documentation: `
    This rule prevents a UCJ status from being set above ACTION_REQUIRED if the
    user in context does not have
  `,

  constants: [
    {
      type: 'String',
      name: 'PERMISSION',
      value: 'service.crunchService.unsafeSetStatus'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            var ol = (UserCapabilityJunction) oldObj;
            var nu = (UserCapabilityJunction) obj;
            var auth = (AuthService) x.get("auth");

            if ( ol == null ) {
              if ( ! auth.check(x, PERMISSION) ) nu.setStatus(ACTION_REQUIRED);
              return;
            }

            if (
              nu.getStatus() == AVAILABLE || nu.getStatus() == ACTION_REQUIRED
            ) {
              // TODO: Update code when decision is made about isRenewable
              return;
            }

            if ( ! auth.check(x, PERMISSION) ) nu.setStatus(ol.getStatus());

          }
        }, "authorize ucj status on put");
      `
    }
  ]
});
