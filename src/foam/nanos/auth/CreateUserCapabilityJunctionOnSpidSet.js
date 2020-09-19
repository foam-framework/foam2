/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

/**
 * @license
 * Copyright 2020 nanopay Inc. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CreateUserCapabilityJunctionOnSpidSet',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Create a UserCapabilityJunction between User and ServiceProvider when spid is set on user create or update',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            User user = (User) obj;
            User old = (User) oldObj;
    
            String spid = user.getSpid() == null ? null : user.getSpid().trim();
            String oldSpid = old == null || old.getSpid() == null ? null : old.getSpid().trim();
    
            if ( spid == null || spid.isEmpty() || spid.equals(oldSpid) ) return;
    
            DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
            UserCapabilityJunction userSpidJunction = new UserCapabilityJunction.Builder(x)
              .setSourceId(user.getId())
              .setTargetId(spid)
              .build();
    
            try {
              userSpidJunction = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(systemX, userSpidJunction);
              if ( userSpidJunction == null || userSpidJunction.getStatus() != foam.nanos.crunch.CapabilityJunctionStatus.GRANTED) 
                throw new RuntimeException("Error setting up UserCapabilityJunction for user: " + user.getId() + " and spid: " + spid);
            } catch (Exception e) {
              Logger logger = (Logger) x.get("logger");
              logger.warning(e);
            }
          }
        }, "Create ucj on user spid set");
      `
    }
  ]
});