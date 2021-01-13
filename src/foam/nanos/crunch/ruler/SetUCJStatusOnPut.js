/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'SetUCJStatusOnPut',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj; 
            
            // other relevant possibilities for ucj statuses are EXPIRED, ACTION_REQUIRED.
            // However, if the ucj is in either of these two statuses, it implies that the data
            // was not validated in previous ruleaction. Thus we know that it is in the correct status
            // already and do not need to go through this step
            if ( 
              ucj.getStatus() != CapabilityJunctionStatus.PENDING && 
              ucj.getStatus() != CapabilityJunctionStatus.APPROVED && 
              ucj.getStatus() != CapabilityJunctionStatus.GRANTED 
            ) 
              return;

            CapabilityJunctionStatus chainedStatus = checkPrereqsChainedStatus(x, ucj);

            // the following should be checked if the result of previous rule ( validateUCJDataOnPut ) 
            // is not ACTION_REQUIRED. In the ACTION_REQUIRED case, the ucj should be put into the
            // dao without any additional checks

            Capability capability = (Capability) ucj.findTargetId(systemX);

            boolean reviewRequired = capability.getReviewRequired();
            boolean wasApproved = ucj.getStatus() == CapabilityJunctionStatus.APPROVED;

            // Update current UCJ status

            ucj.setStatus(chainedStatus);
            if ( chainedStatus == CapabilityJunctionStatus.PENDING && reviewRequired && wasApproved ) {
              ucj.setStatus(CapabilityJunctionStatus.APPROVED);
            } else if ( chainedStatus == CapabilityJunctionStatus.GRANTED && reviewRequired ) {
              ucj.setStatus(wasApproved ? CapabilityJunctionStatus.GRANTED : CapabilityJunctionStatus.PENDING);
            }
          }
        }, "set ucj status on put");
      `
    },   
    {
      name: 'checkPrereqsChainedStatus',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'ucj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        }
      ],
      type: 'CapabilityJunctionStatus',
      documentation: `
        Check statuses of all prerequisite capabilities - returning:
        GRANTED: If all pre-reqs are in granted status
        PENDING: At least one pre-req is still in pending status
        ACTION_REQUIRED: If not any of the above
      `,
      javaCode: `
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability cap = (Capability) capabilityDAO.find(ucj.getTargetId());
        return cap.getPrereqsChainedStatus(x, ucj);
      `
    }
  ]
});
