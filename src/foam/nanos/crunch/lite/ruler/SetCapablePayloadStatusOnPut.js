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
        Capable capableTarget = ((CapableAdapterDAO) x.get("capableObjectDAO")).getCapable();
        
        CapablePayload payload = (CapablePayload) obj;

        CapabilityJunctionStatus defaultStatus = PENDING;

        FObject data = payload.getData();
        if ( data != null ) {
          data.validate(x);
          payload.setStatus(defaultStatus);
        }

        if ( payload.getStatus() != defaultStatus ) {
          return;
        }

        Capability cap = payload.getCapability();
        payload.setStatus(cap.getCapableChainedStatus(x));
      `,
    }
  ]
});
