/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite.ruler',
  name: 'ReputDependantPayloads',

  implements: [
    'foam.nanos.ruler.RuleAction',
  ],

  javaImports: [
    'foam.nanos.crunch.Capability',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CapableAdapterDAO payloadDAO = (CapableAdapterDAO) x.get("capableObjectDAO");
        Capable capableTarget = payload.getCapable();
        
        CapablePayload payload = (CapablePayload) obj;

        // Instead of querying the prerequisite DAO, take a shortcut of
        // reputting all the payloads, since there will never be a large
        // amount and it doesn't create journal writes.
        CapablePayload[] payloads = capableTarget.getCapablePayloads();
        for ( CapablePayload payload : payloads ) {
          payloadDAO.put(payload);
        }
      `,
    }
  ]
});
