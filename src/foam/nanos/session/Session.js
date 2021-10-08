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
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.medusa.Clusterable'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.*',
    'foam.nanos.auth.Subject',
    'foam.nanos.boot.NSpec',
    'foam.nanos.crunch.ServerCrunchService',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.Date',
    'java.util.Random',
    'java.util.UUID',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request'
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
      includeInDigest: true,
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'userId',
      includeInDigest: true,
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
      includeInDigest: true,
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
      includeInDigest: true,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      includeInDigest: true,
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      includeInDigest: true,
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
      includeInDigest: true,
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
      includeInDigest: true,
      visibility: 'RO',
      tableWidth: 120
    },
    {
      documentation: `Restrict access to long TTL session to particular IP address range.

@see https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing
List entries are of the form: 172.0.0.0/24 - this would restrict logins to the 172 network.`,
      class: 'FObjectArray',
      of: 'foam.net.CIDR',
      name: 'cidrWhiteList',
      includeInDigest: true
    },
    {
      class: 'Object',
      name: 'context',
      type: 'Context',
      javaFactory: 'return reset(getX());',
      visibility: 'HIDDEN',
      transient: true,
      networkTransient: true,
      clusterTransient: true
    },
    {
      class: 'Boolean',
      name: 'twoFactorSuccess',
      visibility: 'HIDDEN',
      value: false,
      networkTransient: true
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: true,
      visibility: 'HIDDEN',
      storageTransient: true,
      clusterTransient: true
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
      name: 'validateRemoteHost',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaThrows: ['foam.core.ValidationException'],
      javaCode: `
      String remoteIp = foam.net.IPSupport.instance().getRemoteIp(x);
      foam.net.CIDR[] cidrs = getCidrWhiteList();
      if ( remoteIp == null ||
           SafetyUtil.isEmpty(getRemoteHost()) ||
           SafetyUtil.equals(getRemoteHost(), remoteIp) ||
           cidrs == null ||
           cidrs.length == 0 ) {
        return;
      }

      // Check whitelisted IP addresses
      for ( foam.net.CIDR cidr : cidrs ) {
        try {
          if ( cidr.inRange(x, remoteIp) ) {
            return;
          }
        } catch (java.net.UnknownHostException e) {
          ((foam.nanos.logger.Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "validateRemoteHost", remoteIp, e.getMessage());
        }
      }

      // Do not allow IP to change if not in whitelist
      if ( ! SafetyUtil.isEmpty(getRemoteHost()) &&
           ! SafetyUtil.equals(getRemoteHost(), remoteIp) ) {
        throw new foam.core.ValidationException("IP changed");
      }

      throw new foam.core.ValidationException("Restricted IP");
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
          .put("spid", null)
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

        // Support hierarchical SPID context
        var subX = rtn.cd(user.getSpid());
        if ( subX != null ) {
          rtn = reset(subX);
        }
        rtn = rtn
          .put("subject", subject)
          .put("spid", user.getSpid())
          .put("logger", new PrefixLogger(prefix, (Logger) x.get("logger")))
          .put("twoFactorSuccess", getContext().get("twoFactorSuccess"))
          .put(CachingAuthService.CACHE_KEY, getContext().get(CachingAuthService.CACHE_KEY))
          .put(ServerCrunchService.CACHE_KEY, getContext().get(ServerCrunchService.CACHE_KEY));

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
          ((Logger) x.get("logger")).warning("Session", "User not found.", userId);
          throw new RuntimeException(String.format("User with id '%d' not found.", userId));
        }

        if ( ! user.getEnabled() ) {
          throw new RuntimeException(String.format("The user with id '%d' has been disabled.", userId));
        }
      `
    }
  ]
});
