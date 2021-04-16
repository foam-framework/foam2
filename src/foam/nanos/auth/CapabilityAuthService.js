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
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.LimitedSink',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',

    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'check',
      documentation: `
      Check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        return getDelegate().check(x, permission) || ( user != null && capabilityCheck(x, user, permission) );
      `
    },
    {
      name: 'checkUser',
      javaCode: `
        return getDelegate().checkUser(x, user, permission) || capabilityCheck(x, user, permission);
      `
    },
    {
      name: 'capabilityCheck',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      documentation: `
        Check if the given input string is in the userCapabilityJunctions or
        implied by a capability in userCapabilityJunctions for a given user.
      `,
      javaCode: `
        if ( x == null || permission == null ) return false;
        if ( x.get(Session.class) == null ) return false;
        if ( user == null || ! user.getEnabled() ) return false;
        User realUser = ((Subject) x.get("subject")).getRealUser();

        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          Predicate capabilityScope = OR(
              NOT(HAS(UserCapabilityJunction.EXPIRY)),
              NOT(EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.EXPIRED))
          );
          AbstractPredicate predicate = new AbstractPredicate(x) {
            @Override
            public boolean f(Object obj) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
              if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
                Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
                if ( c != null && ! c.isDeprecated(x) && c.grantsPermission(permission) ) {
                  return true;
                }
              }
              return false;
            }
          };

          // Check if a ucj implies the subject.user(business) has this permission
          Predicate userPredicate = AND(
            NOT(INSTANCE_OF(AgentCapabilityJunction.class)),
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
          );
          if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
            return true;
          }

          // Check if a ucj implies the subject.realUser has this permission
          if ( realUser != null && realUser.getId() != user.getId() && realUser.getSpid().equals(user.getSpid()) ) {
            userPredicate = AND(
              NOT(INSTANCE_OF(AgentCapabilityJunction.class)),
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
            );
            if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
              return true;
            }
          }

          // Check if a ucj implies the subject.realUser has this permission in relation to the user
          if ( realUser != null && realUser.getId() != user.getId() ) {
            userPredicate = AND(
              INSTANCE_OF(AgentCapabilityJunction.class),
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId())
            );
            if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
              return true;
            }
          }
        } catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error("capabilityCheck", permission, e);
        }

        maybeIntercept(x, permission);
        return false;
      `
    },
    {
      name: 'maybeIntercept',
      documentation: `
        This method might throw a CapabilityIntercept if a capability can intercept.
      `,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'permission',
          type: 'String'
        }
      ],
      javaCode: `
        DAO capabilityDAO = (DAO) getX().get("localCapabilityDAO");

        // Find intercepting capabilities
        List<Capability> capabilities =
          ( (ArraySink) capabilityDAO.where(CONTAINS(Capability.PERMISSIONS_INTERCEPTED, permission))
            .select(new ArraySink()) ).getArray();

        if ( capabilities.size() < 1 ) return;

        // Add filteredCapabilities to a runtime exception and throw it
        CapabilityIntercept ex = new CapabilityIntercept(
          "Permission [" + permission + "] denied. Filtered Capabilities available.");
        for ( Capability cap : capabilities ) {
          if ( cap.getInterceptIf().f(x) ) ex.addCapabilityId(cap.getId());
        }

        if ( ex.getCapabilities().length > 0 ) throw ex;
      `
    }
  ]
});
