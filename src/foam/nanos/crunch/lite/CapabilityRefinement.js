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
    'foam.nanos.crunch.lite.CapablePayload',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
  ],

  implements: [
    'foam.nanos.crunch.lite.CapableCompatibleCapability'
  ],

  methods: [
    {
      name: 'getCapableChainedStatus',
      javaCode: `
        // These two statements duplicate getPrereqsChainedStatus
        DAO myPrerequisitesDAO = ((DAO)
          x.get("prerequisiteCapabilityJunctionDAO"))
            .where(
              EQ(CapabilityCapabilityJunction.SOURCE_ID, getId()));
        List<CapabilityCapabilityJunction> ccJunctions =
          ((ArraySink) myPrerequisitesDAO.select(new ArraySink()))
          .getArray();
        
        boolean isPending = false;
        boolean isRejected = false;

        for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
          CapablePayload prereqPayload = (CapablePayload)
            capablePayloadDAO.find(ccJunction.getTargetId());

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
