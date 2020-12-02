/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'SimpleSessionService',

  documentation: `
    A simple implementation of the SessionService interface. Uses SPID-based
    access control checks. Allows SPID administrators to create sessions for
    users in the SPID they administrate.
  `,

  implements: ['foam.nanos.session.SessionService'],

  imports: [
    'AuthService auth',
    'DAO localSessionDAO',
    'DAO localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  methods: [
    // Interface methods
    {
      name: 'createSession',
      javaCode: `
        return createSessionWithTTL(x, userId, agentId, 0);
      `
    },
    {
      name: 'createSessionWithTTL',
      javaCode: `
        if ( userId < 1 ) {
          throw new IllegalArgumentException("User id must be a positive integer.");
        }

        if ( ! hasSPIDPermission(x, "create", userId) ) {
          throw new AuthorizationException("You don't have permission to create a session for that user.");
        }

        Session session = new Session.Builder(x)
          .setUserId(userId)
          .setAgentId(agentId)
          .build();

        if ( ttl > 0 ) {
          session.setTtl(ttl);
        }

        session = (Session) ((DAO) getLocalSessionDAO()).inX(x).put(session);

        // TODO: Change to access token property when we support that.
        return session.getId();
      `
    },
    {
      name: 'hasSPIDPermission',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'operation', type: 'String' },
        { name: 'userId', type: 'Long' }
      ],
      type: 'Boolean',
      javaCode: `
        AuthService auth         = (AuthService) getAuth();
        DAO         localUserDAO = (DAO) getLocalUserDAO();
        User        sessionUser  = (User) localUserDAO.inX(x).find(userId);

        if ( sessionUser == null ) throw new RuntimeException(String.format("User with id '%d' not found.", userId));

        String spid = sessionUser.getSpid();
        if ( SafetyUtil.isEmpty(spid) ) spid = "*";
        return auth.check(x, String.format("session.%s.%s", operation, spid));
      `
    }
  ]
});
