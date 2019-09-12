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

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
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
      // Put a null user to prevent sytem user from leaking into subcontexts
      javaFactory: 'return getX().put("user", null).put("group", null).put(Session.class, this);',
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
      name: 'checkOwnership',
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
      name: 'authorizeOnCreate',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        if (
          ! checkOwnership(x) &&

          // TODO: This permission scheme doesn't make sense for create. We're
          // not going to assign permissions like
          // 'session.create.0b2ac741-010e-4af9-bc43-dd86c88bbe6a' to people. It
          // would make more sense to allow certain users or groups to create
          // sessions for other users in a limited scope. For example, within
          // the same spid.
          ! auth.check(x, createPermission("create"))
        ) {
          throw new AuthorizationException("You don't have permission to create sessions other than your own.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        AuthService auth       = (AuthService) x.get("auth");
        Session     oldSession = (Session) oldObj;

        if (
          ! checkOwnership(x) &&
          ! oldSession.checkOwnership(x) &&
          ! auth.check(x, createPermission("update"))
        ) {
          throw new AuthorizationException("You don't have permission to update sessions other than your own.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        if (
          ! checkOwnership(x) &&
          ! auth.check(x, "*")
        ) {
          throw new AuthorizationException("You don't have permission to delete sessions other than your own.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        if (
          ! checkOwnership(x) &&
          ! auth.check(x, createPermission("read"))
        ) {
          throw new AuthorizationException("You don't have permission to view sessions other than your own.");
        }
      `
    },
    {
      name: 'createPermission',
      args: [
        { name: 'operation', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        return "session." + operation + "." + getId();
      `
    }
  ]
});
