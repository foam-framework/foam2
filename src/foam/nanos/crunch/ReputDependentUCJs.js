/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'ReputDependentUCJs',

  documentation: `If ucj not granted or in grace_period, then the ucj is in a state where its dependents may need to be updated.
  note: granted ucjs go through SaveUCJDataOnGranted and grace_period is really just an extension of granted.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.ArrayList',
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
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            CapabilityJunctionStatus status = ucj.getStatus();

            boolean isInvalidate = ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getStatus() != CapabilityJunctionStatus.GRACE_PERIOD;
            Long effectiveUser = ( ucj instanceof AgentCapabilityJunction ) ? ((AgentCapabilityJunction) ucj).getEffectiveUser() : null;
            DAO filteredUserCapabilityJunctionDAO = (DAO) userCapabilityJunctionDAO
              .where(AND(
                EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
                OR(
                  NOT(INSTANCE_OF(foam.nanos.crunch.AgentCapabilityJunction.class)),
                  EQ(AgentCapabilityJunction.EFFECTIVE_USER, effectiveUser)
                )
              ));
            DAO filteredPrerequisiteCapabilityJunctionDAO = (DAO) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
              .where(EQ(CapabilityCapabilityJunction.TARGET_ID, ucj.getTargetId()));
            
            List<CapabilityCapabilityJunction> ccjs = ((ArraySink) filteredPrerequisiteCapabilityJunctionDAO
              .select(new ArraySink()))
              .getArray();

            List<UserCapabilityJunction> ucjsToReput = new ArrayList<UserCapabilityJunction>();

            for ( CapabilityCapabilityJunction ccj : ccjs ) {
              UserCapabilityJunction ucjToReput = (UserCapabilityJunction) filteredUserCapabilityJunctionDAO
                .find(EQ(UserCapabilityJunction.TARGET_ID, ccj.getSourceId()));
              if ( ucjToReput != null ) ucjsToReput.add(ucjToReput);
            }

            for ( UserCapabilityJunction ucjToReput : ucjsToReput ) {
              if ( isInvalidate ) ucjToReput.setStatus(cascadeInvalidateStatus(x, ucjToReput, status));
              userCapabilityJunctionDAO.inX(x).put(ucjToReput);
            }
          }
        }, "Reput the UCJs of dependent capabilities");
      `
    },
    {
      name: 'cascadeInvalidateStatus',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'ucj', javaType: 'foam.nanos.crunch.UserCapabilityJunction' },
        { name: 'prereqStatus', javaType: 'foam.nanos.crunch.CapabilityJunctionStatus' }
      ],
      javaType: 'foam.nanos.crunch.CapabilityJunctionStatus',
      javaCode: `
        CapabilityJunctionStatus newStatus = ucj.getStatus();

        Capability capability = (Capability) ucj.findTargetId(x);
        boolean reviewRequired = capability.getReviewRequired();

        switch ( (CapabilityJunctionStatus) prereqStatus ) {
          case AVAILABLE : 
            newStatus = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case ACTION_REQUIRED : 
            newStatus = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          case PENDING : 
            newStatus = reviewRequired && 
              ( newStatus == CapabilityJunctionStatus.APPROVED || 
                newStatus == CapabilityJunctionStatus.GRANTED || 
                newStatus == CapabilityJunctionStatus.GRACE_PERIOD 
              ) ? 
                CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
            break;
          case APPROVED : 
            newStatus = reviewRequired && 
            ( newStatus == CapabilityJunctionStatus.APPROVED || 
              newStatus == CapabilityJunctionStatus.GRANTED || 
              newStatus == CapabilityJunctionStatus.GRACE_PERIOD 
            ) ? 
              CapabilityJunctionStatus.APPROVED : CapabilityJunctionStatus.PENDING;
            break;
          case EXPIRED :
            newStatus = CapabilityJunctionStatus.ACTION_REQUIRED;
            break;
          default : // GRACE_PERIOD AND GRANTED
        }
        return newStatus;

      `
    }
  ]
});
