/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'Session',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.Subject',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'userId',
    'agentId',
    'created',
    'lastUsed',
    'ttl',
    'uses',
    'remoteHost'
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
          this.add(' ', user && user.toSummary());
        }.bind(this));
      },
      required: true,
      updateVisibility: 'RO'
    },
    {
      class: 'Long',
      name: 'agentId',
      tableCellFormatter: function(value, obj) {
        if ( ! value ) return;
        this.add(value);
        this.__context__.userDAO.find(value).then(function(user) {
          this.add(' ', user.toSummary());
        }.bind(this));
      },
      visibility: 'RO'
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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
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
      tableWidth: 70,
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
      tableWidth: 70,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'remoteHost',
      visibility: 'RO',
      tableWidth: 120
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
      javaFactory: 'return reset(getX());',
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
        if ( SafetyUtil.isEmpty(getRemoteHost()) || SafetyUtil.equals(getRemoteHost(), remoteHost) ) {
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
      name: 'reset',
      type: 'Context',
      args: [
        { type: 'Context', name: 'x' }
      ],
      documentation: `
        Return a subcontext of the given context where the security-relevant
        entries have been reset to their empty default values.
      `,
      javaCode: `
      Subject subject = new Subject.Builder(x).setUser(null).build();
        return x
          .put(Session.class, this)
          .put("subject", subject)
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
        // We null out the security-relevant entries in the context since we
        // don't want whatever was there before to leak through, especially
        // since the system context (which has full admin privileges) is often
        // used as the argument to this method.
        X rtn = reset(x);

        if ( getUserId() == 0 ) {
          HttpServletRequest req = x.get(HttpServletRequest.class);
          if ( req == null ) {
            // null during test runs
            return rtn;
          }
          AppConfig appConfig = (AppConfig) x.get("appConfig");
          appConfig = (AppConfig) appConfig.fclone();

          Theme theme = ((Themes) x.get("themes")).findTheme(x);
          rtn = rtn.put("theme", theme);

          AppConfig themeAppConfig = theme.getAppConfig();
          if ( themeAppConfig != null ) {
            appConfig.copyFrom(themeAppConfig);
          }
          appConfig = appConfig.configure(x, null);

          rtn = rtn.put("appConfig", appConfig);

          return rtn;
        }

        // Validate
        validate(x);

        DAO localUserDAO  = (DAO) x.get("localUserDAO");
        DAO localGroupDAO = (DAO) x.get("localGroupDAO");
        AuthService auth  = (AuthService) x.get("auth");
        User user         = (User) localUserDAO.find(getUserId());
        User agent        = (User) localUserDAO.find(getAgentId());
        Object[] prefix   = agent == null
          ? new Object[] { String.format("%s (%d)", user.toSummary(), user.getId()) }
          : new Object[] { String.format("%s (%d) acting as %s (%d)", agent.toSummary(), agent.getId(), user.toSummary(), user.getId()) };

        Subject subject = new Subject();
        subject.setUser(agent);
        subject.setUser(user);
        rtn = rtn
          .put("subject", subject)
          .put("logger", new PrefixLogger(prefix, (Logger) x.get("logger")))
          .put("twoFactorSuccess", getContext().get("twoFactorSuccess"))
          .put(CachingAuthService.CACHE_KEY, getContext().get(CachingAuthService.CACHE_KEY));

        if ( user != null ) {
          rtn = rtn.put("spid", user.getSpid());
        }

        // We need to do this after the user and agent have been put since
        // 'getCurrentGroup' depends on them being in the context.
        Group group = auth.getCurrentGroup(rtn);

        if ( group != null ) {
          rtn = rtn
            .put("group", group)
            .put("appConfig", group.getAppConfig(rtn));
        }
        rtn = rtn.put("theme", ((Themes) x.get("themes")).findTheme(rtn));

        return rtn;
      `
    },
    {
      name: 'validate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        if ( getUserId() < 0 ) {
          throw new IllegalStateException("User id is invalid.");
        }

        if ( getAgentId() < 0 ) {
          throw new IllegalStateException("Agent id is invalid.");
        }

        if ( getUserId() > 0 ) {
          checkUserEnabled(x, getUserId());
        }

        if ( getAgentId() > 0 ) {
          checkUserEnabled(x, getAgentId());
        }
      `
    },
    {
      name: 'checkUserEnabled',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'userId', type: 'Long' }
      ],
      javaCode: `
        User user = (User) ((DAO) x.get("localUserDAO")).find(userId);

        if ( user == null
         || (user instanceof LifecycleAware && ((LifecycleAware)user).getLifecycleState() != LifecycleState.ACTIVE)
        ) {
          throw new RuntimeException(String.format("User with id '%d' not found.", userId));
        }

        if ( ! user.getEnabled() ) {
          throw new RuntimeException(String.format("The user with id '%d' has been disabled.", userId));
        }
      `
    }
  ]
});
