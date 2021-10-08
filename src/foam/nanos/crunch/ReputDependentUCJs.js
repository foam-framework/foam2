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
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
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
            CrunchService crunchService = (CrunchService) x.get("crunchService");
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());

            X effectiveX = x;
            Subject junctionSubject = ucj.getSubject(x);
            effectiveX = x.put("subject", junctionSubject);

            Long effectiveUserId = ( ucj instanceof AgentCapabilityJunction ) ? ((AgentCapabilityJunction) ucj).getEffectiveUser() : null;
            DAO filteredUserCapabilityJunctionDAO = (DAO) userCapabilityJunctionDAO
              .where(OR(
                EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
                // TODO: is it really a good idea to update capabilities of a
                //   business when a user's business-associated capability has
                //   a change in status?
                EQ(UserCapabilityJunction.SOURCE_ID, effectiveUserId),
                EQ(AgentCapabilityJunction.EFFECTIVE_USER, ucj.getSourceId()),
                // TODO: consider this new (commented) code for not being commented
                // AND(
                  EQ(AgentCapabilityJunction.EFFECTIVE_USER, effectiveUserId)
                  // EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId())
                // )
              ));

            String[] dependentIds = crunchService.getDependentIds(effectiveX, ucj.getTargetId());

            List<UserCapabilityJunction> ucjsToReput = new ArrayList<UserCapabilityJunction>();

            for ( String dependentId : dependentIds ) {
              UserCapabilityJunction ucjToReput = (UserCapabilityJunction) filteredUserCapabilityJunctionDAO
                .find(EQ(UserCapabilityJunction.TARGET_ID, dependentId));

              // Skip null and AVAILABLE UCJs
              if (
                ucjToReput == null
                || ucjToReput.getStatus() == CapabilityJunctionStatus.AVAILABLE
              ) continue;

              ucjsToReput.add((UserCapabilityJunction) ucjToReput.fclone());
            }

            for ( UserCapabilityJunction ucjToReput : ucjsToReput ) {
              if ( ucjToReput.getStatus() == CapabilityJunctionStatus.GRANTED ) {
                if ( ucj.getIsInGracePeriod() ) ucjToReput.setIsInGracePeriod(true);
                if ( ucj.getIsRenewable() ) ucjToReput.setIsRenewable(true);
              }
              if ( effectiveUserId != null && effectiveX != null &&
                   ucjToReput.getSourceId() == effectiveUserId )
                userCapabilityJunctionDAO.inX(effectiveX).put(ucjToReput);
              else
                userCapabilityJunctionDAO.inX(x).put(ucjToReput);
            }
          }
        }, "Reput the UCJs of dependent capabilities");
      `
    }
  ]
});
