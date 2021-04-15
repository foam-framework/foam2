/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapabilityRefinement',
  refines: 'foam.nanos.crunch.Capability',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.CrunchService',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  implements: [
    'foam.nanos.crunch.lite.CapableCompatibleCapability'
  ],

  methods: [
    {
      name: 'getCapableChainedStatus',
      javaCode: `
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        List<String> prereqCapIds = crunchService.getPrereqs(x, getId(), null);

        if ( prereqCapIds == null || prereqCapIds.size() == 0 ) return GRANTED;

        boolean isPending = false;
        boolean isRejected = false;

        for ( String capId : prereqCapIds ) {
          CapabilityJunctionPayload prereqPayload = (CapabilityJunctionPayload)
            capablePayloadDAO.find(capId);

          if ( prereqPayload == null ) {
            return ACTION_REQUIRED;
          }

          switch ( prereqPayload.getStatus() ) {
            case PENDING:
              isPending = true;
              continue;
            case GRANTED:
              continue;
            case REJECTED:
              isRejected = true;
              break;
            default:
              return ACTION_REQUIRED;
          }
        }

        return isRejected
                ? REJECTED
                : isPending ? PENDING : GRANTED;
      `
    }
  ]
});
