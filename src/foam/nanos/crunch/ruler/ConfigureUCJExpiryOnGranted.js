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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.RenewableData',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date'
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
            UserCapabilityJunction old = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());

            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ucj.getIsRenewable() ) return;
            if ( old != null && ! old.getIsRenewable() && 
              ( ( old.getData() == null && ucj.getData() == null ) || old.getData().equals(ucj.getData()) ) 
            ) return;
              
            Capability capability = (Capability) ucj.findTargetId(x);
            if ( capability == null ) {
              Logger logger = (Logger) x.get("logger");
              logger.debug("UCJ Expiry not configured: Capability not found for UCJ targetId : " + ucj.getSourceId());
              return;
            }

            // if the data is Renewable and expiry is user-configured, get the expiry from the RenewableData,
            // otherwise, get the expiry from the capability
            FObject data = ucj.getData();
            
            Date junctionExpiry = data instanceof RenewableData && ((RenewableData) data).getDataConfiguredExpiry() ?
              ((RenewableData) data).getExpiry() :
              capability.getExpiry(); 

            ucj.resetRenewalStatus();
    
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
            if ( junctionExpiry != null && ( data instanceof RenewableData ) ) {
              ((RenewableData) data).setRenewable(false);
              ((RenewableData) data).setReviewed(false);
              ucj.setData(data);
            } 
    
            if ( capability.getGracePeriod() > 0 ) {
              ucj.setGracePeriod(capability.getGracePeriod());
            }
          }
        }, "");
      `
    }
  ]
});
