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
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapablePayload',
    'foam.nanos.crunch.lite.CapableAdapterDAO',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            CapableAdapterDAO payloadDAO = (CapableAdapterDAO) x.get("capablePayloadDAO");
            CapablePayload payload = (CapablePayload) obj;

            DAO capablePayloadDAO = (DAO) x.get(payload.getDaoKey());

            Object capableObject = capablePayloadDAO.find(payload.getObjId());

            Capable capableTarget = (Capable) capableObject;
            
            // Instead of querying the prerequisite DAO, take a shortcut of
            // reputting all the payloads, since there will never be a large
            // amount and it doesn't create journal writes.
            CapablePayload[] payloads = capableTarget.getCapablePayloads();
            for ( CapablePayload currentPayload : payloads ) {
              payloadDAO.put(currentPayload);
            }
          }
        }, "Reput dependent payloads");
      `,
    }
  ]
});
