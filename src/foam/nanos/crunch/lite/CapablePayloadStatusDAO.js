/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapablePayloadStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.lite.Capable',
    'foam.nanos.crunch.lite.CapableAdapterDAO',
    'foam.nanos.crunch.CapabilityJunctionPayload',

    'foam.nanos.logger.Logger',

    'java.util.List',
    'java.util.Arrays',

    'static foam.mlang.MLang.*',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Logger  logger = (Logger) x.get("logger");

        CapableAdapterDAO tempPayloadDAO = (CapableAdapterDAO) x.get("capablePayloadDAO");
        Capable capableTarget = tempPayloadDAO.getCapable();
        var payloadDAO = (DAO) capableTarget.getCapablePayloadDAO(x);

        CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

        CapabilityJunctionStatus defaultStatus = PENDING;

        try {
          payload.validate(x);
        } catch ( IllegalStateException e ) {
          // this shouldn't happen because a CRE was thrown earlier; here for a fail safe
          logger.warning(e);
          return obj;
        }

        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability cap = (Capability) capabilityDAO.find(payload.getCapability());
        var oldStatus = payload.getStatus();
        var newStatus = cap.getCapableChainedStatus(x, payloadDAO, payload);

        if ( oldStatus == APPROVED && newStatus == PENDING ) {
          newStatus = APPROVED;
        }

        if ( oldStatus == REJECTED  ) {
          if ( newStatus == PENDING ){
            var crunchService = (CrunchService) x.get("crunchService");
            payload.setStatus(REJECTED);
            List<String> prereqIdsList = crunchService.getPrereqs(x, payload.getCapability(), null);

            if ( prereqIdsList != null && prereqIdsList.size() > 0 ){
              String[] prereqIds = prereqIdsList.toArray(new String[prereqIdsList.size()]);

              ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
              .filter(cp -> Arrays.stream(prereqIds).anyMatch(((CapabilityJunctionPayload) cp).getCapability()::equals))
              .forEach(cp -> {
                CapabilityJunctionPayload capableCp = (CapabilityJunctionPayload) cp;
                capableCp.setStatus(REJECTED);
                capableCp.setHasSafeStatus(true);
                payloadDAO.put(capableCp);
              });
            }
          }

          newStatus = REJECTED;
        }

        if ( cap.getReviewRequired() ) {
          if ( oldStatus == PENDING && newStatus != REJECTED ) {
            return getDelegate().put_(x, obj);
          }
          if ( oldStatus == ACTION_REQUIRED && newStatus == GRANTED ) {
            newStatus = PENDING;
          }
        }

        if ( oldStatus != newStatus )  {
          payload.setStatus(newStatus);
          // TODO Maybe use projection MLang
          var crunchService = (CrunchService) x.get("crunchService");
          var depIds = crunchService.getDependentIds(x, payload.getCapability());

          ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
          .filter(cp -> Arrays.stream(depIds).anyMatch(((CapabilityJunctionPayload) cp).getCapability()::equals))
          .forEach(cp -> {
            CapabilityJunctionPayload capableCp = (CapabilityJunctionPayload) cp;
            capableCp.setHasSafeStatus(true);
            payloadDAO.put(capableCp);
          });
        }

        return getDelegate().put_(x, obj);
      `
    }
  ]
});
