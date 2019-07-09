/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CapabilityAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',
  documentation: `
  this decorator checks for either a capability or permission string. If the check returns false, delegate to next authservice. Return true otherwise.
  `,

  implements: [
    'foam.nanos.auth.AuthService',
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.List',
    'javax.security.auth.AuthPermission',
    'static foam.mlang.MLang.*'
  ],

  imports: [

  ],

  methods: [
    {
      name: 'check',
      documentation: `
      check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
      if ( x == null || permission == null ) return false;
      if ( x.get(Session.class) == null ) return false;
      User user = (User) x.get("user");
      if( user == null || ! user.getEnabled() ) return false;

      // temporary fix to get around authservice being called on build before some services (userCapabilityJunctionDAO) are available
      if ( user.getId() == 1 ) return true;  

      // check whether user has permission to check user permissions
      if ( ! getDelegate().check(x, "service.auth.checkUser") ) throw new AuthorizationException();

      try {
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

        if( userCapabilityJunctionDAO.find(
          AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            EQ(UserCapabilityJunction.TARGET_ID, permission),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          )) != null ) return true;
        
        List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          )) 
          .select(new ArraySink()))
          .getArray();
        
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");

        for( UserCapabilityJunction ucJunction : userCapabilityJunctions ) {
          Capability capability = (Capability) capabilityDAO.find(ucJunction.getTargetId());
          if( capability.implies(x, permission) ) return true;
        }
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.error("check", permission, e);
      } 

      return getDelegate().check(x, permission);
      `
    },     
    {
      name: 'checkUser',
      documentation: `
      check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for a given user
      `,
      javaCode: `
 
      if( x == null || permission == null ) return false;
      if( x.get(Session.class) == null ) return false;
      if( user == null || ! user.getEnabled() ) return false;

      // temporary fix to get around authservice being called on build before some services (userCapabilityJunctionDAO) are available
      if ( user.getId() == 1 ) return true;  
      
      // check whether user has permission to check user permissions
      if ( ! getDelegate().check(x, "service.auth.checkUser") ) throw new AuthorizationException();

      try {
        DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

        if( userCapabilityJunctionDAO.find(
          AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            EQ(UserCapabilityJunction.TARGET_ID, permission),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          )) != null ) return true;
        
        List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
          )) 
          .select(new ArraySink()))
          .getArray();
        
        DAO capabilityDAO = (DAO) x.get("capabilityDAO");

        for( UserCapabilityJunction ucJunction : userCapabilityJunctions ) {
          Capability capability = (Capability) capabilityDAO.find(ucJunction.getTargetId());
          if( capability.implies(x, permission) ) return true;
        }
      } catch (Exception e) {
        Logger logger = (Logger) x.get("logger");
        logger.error("check", permission, e);
      } 

      return getDelegate().checkUser(x, user, permission);
      `
    },
    {
      name: 'checkUserPermission',
      javaCode: `
      return checkUser( x, user, permission.getName() );
      `
    },
  ]
});
