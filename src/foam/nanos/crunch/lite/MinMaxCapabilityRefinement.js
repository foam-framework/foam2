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
