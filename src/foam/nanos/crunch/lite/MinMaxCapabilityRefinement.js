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
      documentation: `
        numberGrantedOrPending are  the available CapablePayloads which are GRANTED or can eventually be turned into 
        GRANTED from PENDING state. If  MinMaxCapability.min is greater than the number of available payloads which are GRANTED or 
        can eventually be turned into GRANTED, then it is impossible for the total amount of GRANTED payloads to be greater than the MIN, 
        thereby fulfilling the minimum requirement.

        For example, let there be a min max capablity which has 10 prerequisites and a min of 2.

        If the user selected only 3 of those prereqs in the wizard, then the CapablePayload.status for those 3 will each be in PENDING 
        state with approvals generated for each one. Note, there will only be these 3 CapablePayloads out of the 10 Prereqs avaliable on the 
        Capable object since the user only selected 3.

        If 1 of those 3 CapablePayloads get rejected. Then there will be 2 numberGrantedOrPending which could still potentially satisfy 
        the min requirement of 2 if those 2 CapablePayloads get set to GRANTED.

        If 2 of those 3 CapablePayloads get rejected. Then there will be 1 numberGrantedOrPending which would be impossible to satisfy the 
        MinMaxCapability.min requirement of 2 even if that 1 CapablePayload is GRANTED.
      `,
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
