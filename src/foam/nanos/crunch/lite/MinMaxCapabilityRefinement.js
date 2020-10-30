/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'MinMaxCapabilityRefinement',
  refines: 'foam.nanos.crunch.MinMaxCapability',

  implements: [
    'foam.nanos.crunch.lite.CapableCompatibleCapability'
  ],

  javaImports: [
    'foam.nanos.crunch.lite.CapablePayload',

    'static foam.nanos.crunch.CapabilityJunctionStatus.*'
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
        
        int numberGranted = 0;
        int numberPending = 0;
        int numberRejected = 0;

        for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
          CapablePayload prereqPayload = (CapablePayload)
            capablePayloadDAO.find(ccJunction.getTargetId());
          
          if ( prereqPayload == null ) {
            continue;
          }
          
          switch ( prereqPayload.getStatus() ) {
            case GRANTED:
              numberGranted++;
              continue;
            case PENDING:
            case APPROVED:
              numberPending++;
              continue;
            case REJECTED:
              numberRejected++;
              continue;
          }
        }

        int numberTotal = numberGranted + numberPending + numberRejected;

        int numberGrantedOrPending = numberGranted + numberPending;

        // TODO: right now this represents the capablePayloads haven't been processed for preqreqs yet
        if ( numberTotal == 0 ){
          return CapabilityJunctionStatus.ACTION_REQUIRED;
        }

        if ( getMin() > numberGrantedOrPending ){
          return CapabilityJunctionStatus.REJECTED;
        }
        if ( numberGranted >= getMin() ) {
          return CapabilityJunctionStatus.GRANTED;
        }
        if ( numberTotal >= getMin() ) {
          return CapabilityJunctionStatus.PENDING;
        }

        return CapabilityJunctionStatus.ACTION_REQUIRED;
      `
    }
  ]
});
