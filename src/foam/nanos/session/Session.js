/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'Session',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  imports: [
    'auth',
    'localUserDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'userId',
      tableCellFormatter: function(value, obj) {
        this.add(value);
        this.__context__.userDAO.find(value).then(function(user) {
          this.add(' ', user && user.label());
        }.bind(this));
      },
      required: true,
      visibility: 'FINAL',
    },
    {
      class: 'Long',
      name: 'agentId',
      tableCellFormatter: function(value, obj) {
        if ( ! value ) return;
        this.add(value);
        this.__context__.userDAO.find(value).then(function(user) {
          this.add(' ', user.label());
        }.bind(this));
      },
      visibility: 'RO',
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastUsed',
      visibility: 'RO',
      storageTransient: true
    },
    {
      class: 'Duration',
      name: 'ttl',
      label: 'TTL',
      documentation: 'The "time to live" of the session. The amount of time in milliseconds that the session should be kept alive after its last use before being destroyed. Must be a positive value or zero.',
      value: 28800000, // 1000 * 60 * 60 * 8 = number of milliseconds in 8 hours
      validationPredicates: [
        {
          args: ['ttl'],
          predicateFactory: function(e) {
            return e.GTE(foam.nanos.session.Session.TTL, 0);
          },
          errorString: 'TTL must be 0 or greater.'
        }
      ]
    },
    {
      class: 'Long',
      name: 'uses',
      storageTransient: true
    },
    {
      class: 'String',
      name: 'remoteHost',
      visibility: 'RO'
    },
    {
      documentation: 'Intended to be used with long TTL sessions, further restricting to a known set of IPs.',
      class: 'StringArray',
      name: 'remoteHostWhiteList'
    },
    {
      class: 'Object',
      name: 'context',
      type: 'Context',
      javaFactory: 'return applyTo(getX());',
      hidden: true,
      transient: true
    }
  ],

  methods: [
    // Disable cloneing and freezing so that Sessions can be mutated while
    // in the SessionDAO.
    {
      name: 'fclone',
      type: 'foam.core.FObject',
      javaCode: 'return this;'
    },
    {
      name: 'freeze',
      type: 'foam.core.FObject',
      javaCode: ' return this; '
    },
    {
      name: 'touch',
      documentation: 'Called when session used to track usage statistics.',
      javaCode: `
        synchronized ( this ) {
          setLastUsed(new Date());
          setUses(getUses()+1);
        }
      `
    },
    {
      name: 'validRemoteHost',
      type: 'Boolean',
      args: [
        {
          name: 'remoteHost', type: 'String'
        }
      ],
      javaCode: `
        if ( SafetyUtil.equals(getRemoteHost(), remoteHost) ) {
          return true;
        }

        for ( String host : getRemoteHostWhiteList() ) {
          if ( SafetyUtil.equals(host, remoteHost) ) {
            return true;
          }
        }

        return false;
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) getAuth();

        if (
          ! isSessionUser(x) &&
          ! hasSPIDPermission(x, "create") &&
          ! ((AuthService) getAuth()).check(x, createPermission("create"))
        ) {
          throw new AuthorizationException("You don't have permission to create that session.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        if (
          ! isSessionUser(x) &&
          ! hasSPIDPermission(x, "read") &&
          ! ((AuthService) getAuth()).check(x, createPermission("read"))
        ) {
          throw new AuthorizationException("You don't have permission to read that session.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        Session oldSession = (Session) oldObj;
        AuthService auth = (AuthService) getAuth();

        if (
          ! isSessionUser(x) &&
          ! oldSession.isSessionUser(x) &&
          ! hasSPIDPermission(x, "update") &&
          ! oldSession.hasSPIDPermission(x, "update") &&
          ! auth.check(x, createPermission("update")) &&
          ! auth.check(x, oldSession.createPermission("update"))
        ) {
          throw new AuthorizationException("You don't have permission to update that session.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        if (
          ! isSessionUser(x) &&
          ! hasSPIDPermission(x, "delete") &&
          ! ((AuthService) getAuth()).check(x, createPermission("delete"))
        ) {
          throw new AuthorizationException("You don't have permission to delete that session.");
        }
      `
    },
    {
      name: 'isSessionUser',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Boolean',
      javaCode: `
        User user = (User) x.get("user");
        return user != null && this.getUserId() == user.getId();
      `
    },
    {
      name: 'hasSPIDPermission',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'operation', type: 'String' }
      ],
      type: 'Boolean',
      javaCode: `
        if ( getUserId() == 0 ) return false;

        AuthService auth         = (AuthService) getAuth();
        DAO         localUserDAO = (DAO) getLocalUserDAO();
        User        sessionUser  = (User) localUserDAO.inX(x).find(getUserId());

        if ( sessionUser == null ) throw new RuntimeException(String.format("User with id '%d' not found.", Long.toString(getUserId())));

        String spid = sessionUser.getSpid();
        return ! SafetyUtil.isEmpty(spid) && auth.check(x, String.format("session.%s.%s", operation, spid));
      `
    },
    {
      name: 'createPermission',
      args: [
        { name: 'operation', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        String id = getId();
        if ( SafetyUtil.isEmpty(id) ) id = "*";
        return "session." + operation + "." + id;
      `
    },
    {
      name: 'applyTo',
      type: 'Context',
      args: [
        { type: 'Context', name: 'x' }
      ],
      documentation: `
        Returns a subcontext of the given context with the user, group, and
        other information relevant to this session filled in if it's appropriate
        to do so.
      `,
      javaCode: `
        X rtn = x
          // We null out the security-relevant entries in the context since we
          // don't want whatever was there before to leak through, especially
          // since the system context (which has full admin privileges) is often
          // used as the argument to this method.
          .put(Session.class, this)
          .put("user", null)
          .put("agent", null)
          .put("group", null)
          .put("twoFactorSuccess", false)
          .put(CachingAuthService.CACHE_KEY, null)
          .put(
            "logger",
            new PrefixLogger(
              new Object[] { "Unauthenticated session" },
              (Logger) x.get("logger")
            )
          );

        if ( getUserId() == 0 ) return rtn;

        DAO localUserDAO  = (DAO) x.get("localUserDAO");
        DAO localGroupDAO = (DAO) x.get("localGroupDAO");
        AuthService auth  = (AuthService) x.get("auth");
        User user         = (User) localUserDAO.find(getUserId());
        User agent        = (User) localUserDAO.find(getAgentId());
        Object[] prefix   = agent == null
          ? new Object[] { String.format("%s (%d)", user.label(), user.getId()) }
          : new Object[] { String.format("%s (%d) acting as %s (%d)", agent.label(), agent.getId(), user.label(), user.getId()) };

        rtn = rtn
          .put("user", user)
          .put("agent", agent)
          .put("logger", new PrefixLogger(prefix, (Logger) x.get("logger")))
          .put("twoFactorSuccess", getContext().get("twoFactorSuccess"))

          // TODO: I'm not sure if this is necessary.
          .put(CachingAuthService.CACHE_KEY, getContext().get(CachingAuthService.CACHE_KEY));

        // We need to do this after the user and agent have been put since
        // 'getCurrentGroup' depends on them being in the context.
        Group group = auth.getCurrentGroup(rtn);

        return rtn
          .put("group", group)
          .put("appConfig", group.getAppConfig(rtn));
      `
    }
  ]
});
