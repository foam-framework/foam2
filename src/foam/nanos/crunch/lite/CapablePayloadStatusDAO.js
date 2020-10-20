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
    'foam.nanos.crunch.lite.CapablePayload',

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

        CapablePayload payload = (CapablePayload) obj;

        CapabilityJunctionStatus defaultStatus = PENDING;

        try {
          payload.validate(x);
        } catch ( IllegalStateException e ) {
          // this shouldn't happen because a CRE was thrown earlier; here for a fail safe
          logger.warning(e);
          return obj;
        }

        Capability cap = payload.getCapability();
        var oldStatus = payload.getStatus();
        var newStatus = cap.getCapableChainedStatus(x, payloadDAO, payload);

        if ( oldStatus == APPROVED && newStatus == PENDING ) {
          newStatus = APPROVED;
        }
        
        if ( payload.getCapability().getReviewRequired() ) {
          if ( oldStatus == PENDING ) {
            return getDelegate().put_(x, obj);
          }
          if ( oldStatus == ACTION_REQUIRED ) {
            newStatus = PENDING;
          }
        }

        if ( oldStatus != newStatus )  {
          payload.setStatus(newStatus);
          // TODO Maybe use projection MLang
          var crunchService = (CrunchService) x.get("crunchService");
          var depIds = crunchService.getDependantIds(x, payload.getCapability().getId());

          ((ArraySink) payloadDAO.select(new ArraySink())).getArray().stream()
          .filter(cp -> Arrays.stream(depIds).anyMatch(((CapablePayload) cp).getCapability().getId()::equals))
          .forEach(cp -> {
            CapablePayload capableCp = (CapablePayload) cp;
            capableCp.setHasSafeStatus(true);
            payloadDAO.put(capableCp);
          });
        }

        return getDelegate().put_(x, obj);
      `
    }
  ]
});
