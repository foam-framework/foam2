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
    'foam.dao.ProxySink',
    'foam.dao.LimitedSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
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

        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");

          Capability cap = (Capability) capabilityDAO.find(permission);
          if ( cap != null && ( cap.isDeprecated(x) || cap.getEnabled() ) ) return getDelegate().checkUser(x, user, permission);

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

          ProxySink proxy = new ProxySink(x, new LimitedSink(x, 1, 0, new ArraySink())) {
            int count = 0;
            @Override
            public void put(Object o, Detachable sub) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) ((UserCapabilityJunction) o).deepClone();
              Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( c != null && ! c.isDeprecated(x) && c.implies(x, permission) ) {
                getDelegate().put(o, sub);
              }
            }
          };

          List<UserCapabilityJunction> ucjs = ((ArraySink) ((ProxySink) ((ProxySink) userCapabilityJunctionDAO
            .where(AND(
              EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
              EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
            ))
            .select(proxy))
            .getDelegate())
            .getDelegate())
            .getArray();
          if ( ucjs.size() > 0 ) return true;

        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        }

        return getDelegate().checkUser(x, user, permission);
      `
    }
  ]
});
