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
    'foam.nanos.crunch.CapabilityRuntimeException',
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

  properties: [
    {
      class: 'Map',
      name: 'cache',
      javaFactory: `
        return new ConcurrentHashMap<String, Boolean>();
      `
    },
    {
      name: 'initialized',
      class: 'Boolean',
      value: false
    }
  ],

  methods: [
    {
      name: 'initialize',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
        if ( getInitialized() )
          return;

        DAO userCapabilityJunctionDAO = (DAO) getX().get("userCapabilityJunctionDAO");
        DAO capabilityDAO = (DAO) getX().get("localCapabilityDAO");
        if ( capabilityDAO == null || userCapabilityJunctionDAO == null )
          return;

        Map<String, Boolean> cache = ( Map<String, Boolean> ) getCache();
        Sink purgeSink = new Sink() {
          public void put(Object obj, Detachable sub) {
            cache.clear();
          }
          public void remove(Object obj, Detachable sub) {
            cache.clear();
          }
          public void eof() {
          }
          public void reset(Detachable sub) {
            cache.clear();
          }
        };

        // Add the purge listener
        userCapabilityJunctionDAO.listen(purgeSink, TRUE);
        capabilityDAO.listen(purgeSink, TRUE);

        // Initialization done
        setInitialized(true);
      `
    },
    {
      name: 'check',
      documentation: `
      Check if the given input string is in the userCapabilityJunctions or implied by a capability in userCapabilityJunctions for the current context user
      `,
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();

        boolean hasViaCrunch = capabilityCheck(x, user, permission);
        return ( user != null && hasViaCrunch ) || getDelegate().check(x, permission);
      `
    },
    {
      name: 'checkUser',
      javaCode: `
        boolean hasViaCrunch = capabilityCheck(x, user, permission);
        return hasViaCrunch || getDelegate().checkUser(x, user, permission);
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
        String realUserKey = realUser.getId() == user.getId() ?
          null :
          user.getId() + ":" + realUser.getId() + permission;
        String userKey = user.getId() + permission;
        this.initialize(x);

        Boolean result = ( (Map<String, Boolean>) getCache() ).get(userKey);
        if ( realUserKey != null ) result = result == null || ! result ?  ( (Map<String, Boolean>) getCache() ).get(realUserKey) : result;
        if ( result != null ) {
          if ( ! result ) maybeIntercept(x, permission);
          return result;
        }

        result = false;

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
              Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED &&
                   c != null && ! c.isDeprecated(x) && c.implies(x, permission) ) {
                return true;
              }
              return false;
            }
          };

          // Check if a ucj implies the subject.user(business) has this permission
          Predicate userPredicate = EQ(UserCapabilityJunction.SOURCE_ID, user.getId());
          if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
            result = true;
          }

          (( Map<String, Boolean> ) getCache()).put(userKey, result);
          if ( result ) {
            return true;
          }

          // Check if a ucj implies the subject.realUser(agent) has this permission
          if ( realUser != null && realUserKey != null ) {
            userPredicate = AND(
              INSTANCE_OF(AgentCapabilityJunction.class),
              EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
              EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId())
            );
            if ( userCapabilityJunctionDAO.find(AND(userPredicate, capabilityScope, predicate)) != null ) {
              result = true;
            }

            (( Map<String, Boolean> ) getCache()).put(realUserKey, result);
            if ( result ) {
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
        This method might throw a CapabilityRuntimeException if a capability can intercept.
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

        for ( Capability c : capabilities ) {
          if ( ! c.getInterceptIf().f(x) ) {
            capabilities.remove(c);
          }
        }

        // Do not throw runtime exception if there are no intercepts
        if ( capabilities.size() < 1 ) return;

        // Add filteredCapabilities to a runtime exception and throw it
        CapabilityRuntimeException ex = new CapabilityRuntimeException(
          "Permission [" + permission + "] denied. Filtered Capabilities available.");
        for ( Capability cap : capabilities ) ex.addCapabilityId(cap.getId());
        throw ex;
      `
    }
  ]
});
