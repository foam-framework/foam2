/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'SetCapablePayloadStatusOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction',
  ],

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapablePayload',
    'foam.nanos.crunch.lite.CapableAdapterDAO',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.core.FObject',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            CapableAdapterDAO payloadDAO = (CapableAdapterDAO) x.get("capablePayloadDAO");
            Capable capableTarget = payloadDAO.getCapable();
            
            CapablePayload payload = (CapablePayload) obj;
    
            CapabilityJunctionStatus defaultStatus = PENDING;
    
            try {
              payload.validate(x);
            } catch ( IllegalStateException e ) {
              return;
            }
    
            Capability cap = payload.getCapability();
            payload.setStatus(cap.getCapableChainedStatus(
              x, payloadDAO, payload));
          }
        }, "Set capable payload status on put");
      `,
    }
  ]
});
