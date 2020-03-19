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
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    'foam.dao.LimitedSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session',
    'java.util.concurrent.ConcurrentHashMap',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
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
        DAO capabilityDAO = (getX().get("capabilityDAO") == null ) ? (DAO) getX().get("capabilityDAO") : (DAO) getX().get("localCapabilityDAO");
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
        User user = (User) x.get("user");

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

        this.initialize(x);

        String key = user.getId() + permission;
        Boolean result = ( (Map<String, Boolean>) getCache() ).get(key);
        if ( result != null ) return result || getDelegate().checkUser(x, user, permission);

        result = false;

        try {
          DAO capabilityDAO = ( x.get("localCapabilityDAO") == null ) ? (DAO) x.get("capabilityDAO") : (DAO) x.get("localCapabilityDAO");
          DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

          // 1. check if there is a capability matching the name of the permission 
          // that is enabled and not deprecated, and granted to the user 
          Capability cap = (Capability) capabilityDAO.find(EQ(foam.nanos.crunch.Capability.NAME, permission));

          Predicate capabilityScope = AND(
            EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
            OR(
              NOT(HAS(UserCapabilityJunction.EXPIRY)),
              NOT(EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.EXPIRED))
            )
          );

          if ( cap != null && cap.getEnabled() ) {

            if ( userCapabilityJunctionDAO.find(
              AND(
                capabilityScope,
                EQ(UserCapabilityJunction.TARGET_ID, cap.getId()),
                EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
              )) != null ) result = true;
            // if the user has the permission, store this in the cache and return the result
            // otherwise, move on to the 2nd part of the check
            if ( result ) {
              ((Map<String, Boolean>) getCache()).put(key, result);
              return result;
            }
          }

          // 2. check if the user has a capability that grants the permission
          AbstractPredicate predicate = new AbstractPredicate(x) {
            @Override
            public boolean f(Object obj) {
              UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
              Capability c = (Capability) capabilityDAO.find(ucj.getTargetId());
              if ( c != null && ! c.isDeprecated(x) && c.implies(x, permission) ) {
                return true;
              }
              return false;
            }
          };

          if ( userCapabilityJunctionDAO.find(AND(capabilityScope, predicate)) != null ) {
            result = true;
          }

          // Add the result to the cache
          (( Map<String, Boolean> ) getCache()).put(key, result);

        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("check", permission, e);
        }

        return result;
      `
    }
  ]
});

