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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapableAdapterDAO',

    'java.util.List',
    'java.util.Arrays',

    'static foam.mlang.MLang.*',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, (agencyX) -> {
          CapableAdapterDAO tempPayloadDAO = (CapableAdapterDAO) agencyX.get("capablePayloadDAO");
          Capable capableTarget = tempPayloadDAO.getCapable();
          var payloadDAO = (DAO) capableTarget.getCapablePayloadDAO(agencyX);

          CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

          CapabilityJunctionStatus defaultStatus = PENDING;

          try {
            payload.validate(agencyX);
          } catch ( IllegalStateException e ) {
            return;
          }

          DAO capabilityDAO = (DAO) x.get("capabilityDAO");
          Capability cap = (Capability) capabilityDAO.find(payload.getCapability());
          var oldStatus = payload.getStatus();
          var newStatus = cap.getCapableChainedStatus(agencyX, payloadDAO, payload);

          if ( oldStatus != newStatus )  {
            payload.setStatus(newStatus);
            // TODO Maybe use projection MLang
            var crunchService = (CrunchService) agencyX.get("crunchService");
            var depIds = crunchService.getDependentIds(agencyX, payload.getCapability());

            ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
            .filter(cp -> Arrays.stream(depIds).anyMatch(((CapabilityJunctionPayload) cp).getCapability()::equals))
            .forEach(cp -> {
              payloadDAO.put((CapabilityJunctionPayload) cp);
            });
          }
        }, "Set capable payload status on put");
      `,
    }
  ]
});
