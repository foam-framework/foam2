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
  This decorator checks for either a capability or permission string. If the check returns false, delegate to next authservice. Return true otherwise.
  `,

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.Date',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'check',
      documentation: `
      Check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
        User user = (User) x.get("user");

        if ( user != null && checkUser(x, user, permission) ) return true;

        return getDelegate().check(x, permission);
      `
    },
    {
      name: 'checkUser',
      documentation: `
        Check if the given input string is in the userCapabilityJunctions or
        implied by a capability in userCapabilityJunctions for a given user.
      `,
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;

        // Check whether user has permission to check user permissions.
        if ( ! getDelegate().check(x, "service.auth.checkUser") ) return false;

        try {
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");

          Capability cap = (Capability) capabilityDAO.find(permission);
          if ( cap != null && cap.isDeprecated(x) ) return getDelegate().checkUser(x, user, permission);

          Date now = new Date();
          Predicate capabilityScope = AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            OR(
              NOT(HAS(UserCapabilityJunction.EXPIRY)),
              NOT(EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.EXPIRED))
            )
          );

          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          if ( userCapabilityJunctionDAO.find(
            AND(
              capabilityScope,
              EQ(UserCapabilityJunction.TARGET_ID, permission),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            )) != null ) return true;

          List<UserCapabilityJunction> userCapabilityJunctions = ((ArraySink) user.getCapabilities(x).getJunctionDAO()
            .where(capabilityScope)
            .select(new ArraySink())).getArray();

          for ( UserCapabilityJunction ucJunction : userCapabilityJunctions ) {
            Capability capability = (Capability) capabilityDAO.find(ucJunction.getTargetId());
            if ( capability.isDeprecated(x) ) continue;
            if ( capability.implies(x, permission) ) return true;
          }
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        }

        return getDelegate().checkUser(x, user, permission);
      `
    }
  ]
});
