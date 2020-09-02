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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj; 

            Capability cap = (Capability) ucj.findTargetId(x);
            System.out.println(">>>>>>>>> SET UCJ STATUS ON PUT");
            System.out.println("ucj = " + cap.getName());
            System.out.println("status = " + ucj.getStatus());
            UserCapabilityJunction oldUcj = (UserCapabilityJunction) (((foam.dao.DAO) x.get("bareUserCapabilityJunctionDAO")).find(ucj.getId()));
            System.out.println("olducj = " + (oldUcj == null ? "null" : oldUcj.getStatus()));

            CapabilityJunctionStatus chainedStatus = checkPrereqsChainedStatus(x, ucj);
            
            if ( ucj.getStatus() != CapabilityJunctionStatus.PENDING && ucj.getStatus() != CapabilityJunctionStatus.APPROVED ) return;

            // the following should be checked if the result of previous rule ( validateUCJDataOnPut ) 
            // is not ACTION_REQUIRED. In the ACTION_REQUIRED case, the ucj should be put into the
            // dao without any additional checks
            Capability capability = (Capability) ucj.findTargetId(x);

            boolean reviewRequired = capability.getReviewRequired();
            boolean wasApproved = ucj.getStatus() == CapabilityJunctionStatus.APPROVED;

            // Update current UCJ status

            ucj.setStatus(chainedStatus);
            System.out.println("ucj = " + capability.getName());
            System.out.println("chainedStatus = " + chainedStatus);
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
        boolean allGranted = true;
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");
        Capability cap = (Capability) capabilityDAO.find(ucj.getTargetId());
        return cap.getPrereqsChainedStatus(x, ucj);
      `
    },
    {
      name: 'getPrereqs',
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
      javaType: 'java.util.List<CapabilityCapabilityJunction>',
      documentation: `
        Returns the list of prerequisiteCapabilityJunctions for the target capability of the ucj
      `, 
      javaCode: `
        DAO prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");

        // get a list of the prerequisite junctions where the current capability is the dependent
        List<CapabilityCapabilityJunction> ccJunctions = (List<CapabilityCapabilityJunction>) ((ArraySink) prerequisiteCapabilityJunctionDAO
        .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, ucj.getTargetId()))
        .select(new ArraySink()))
        .getArray();

        return ccJunctions;
      `
    },
  ]
});
