/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ruler',
  name: 'ConfigureUCJExpiryOnGranted',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date',
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
            Long effectiveUser = ( ucj instanceof AgentCapabilityJunction ) ? ((AgentCapabilityJunction) ucj).getEffectiveUser() : null;
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, ucj.getSourceId()),
              EQ(UserCapabilityJunction.TARGET_ID, ucj.getTargetId()),
              OR(
                NOT(INSTANCE_OF(foam.nanos.crunch.AgentCapabilityJunction.class)),
                EQ(AgentCapabilityJunction.EFFECTIVE_USER, effectiveUser)
              )
            ));

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED 
              || ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) 
              return;
              
            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Logger logger = (Logger) x.get("logger");
              logger.debug("UCJ Expiry not configured: Capability not found for UCJ targetId : " + ucj.getSourceId());
              return;
            }

            // Only update the expiry for non-active junctions, i.e., non-expired, non-pending, or granted junctions whose expiry is not yet set
            if ( ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED && old.getExpiry() != null ) 
              || ucj.getStatus() != CapabilityJunctionStatus.GRANTED )
              return;
    
            Date junctionExpiry = capability.getExpiry();
    
            if ( capability.getDuration() > 0 ) {
              Date today = new Date();
              Calendar calendar = Calendar.getInstance();
              calendar.setTime(today);
              calendar.add(Calendar.DATE, capability.getDuration());
    
              if ( junctionExpiry == null ) {
                junctionExpiry = calendar.getTime();
              } else {
                junctionExpiry = junctionExpiry.after(calendar.getTime()) ? calendar.getTime() : junctionExpiry;
              }
            }
            ucj.setExpiry(junctionExpiry);
    
            if ( capability.getGracePeriod() > 0 ) {
              ucj.setGraceDaysLeft(capability.getGracePeriod());
            }
          }
        }, "");
      `
    }
  ]
});
