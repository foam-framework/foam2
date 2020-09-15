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

        for ( CapabilityCapabilityJunction ccJunction : ccJunctions ) {
          CapablePayload prereqPayload = (CapablePayload)
            capablePayloadDAO.find(ccJunction.getTargetId());
          
          switch ( prereqPayload.getStatus() ) {
            case GRANTED:
              numberGranted++;
              break;
            case PENDING:
            case APPROVED:
              numberPending++;
              break;
          }
        }

        if ( numberGranted >= getMin() ) {
          return CapabilityJunctionStatus.GRANTED;
        }
        if ( numberGranted + numberPending >= getMin() ) {
          return CapabilityJunctionStatus.PENDING;
        }
        return CapabilityJunctionStatus.ACTION_REQUIRED;
      `
    }
  ]
});
