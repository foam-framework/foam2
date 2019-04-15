/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'Session',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      javaFactory: 'return java.util.UUID.randomUUID().toString();',
    },
    {
      class: 'Long',
      name: 'userId',
      tableCellFormatter: function(value, obj) {
        this.add(value);
        this.__context__.userDAO.find(value).then(function(user) {
          this.add(' ', user.label());
        }.bind(this));
      }
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
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();'
    },
    {
      class: 'DateTime',
      name: 'lastUsed'
    },
    {
      class: 'Long',
      name: 'uses'
    },

    /**
     * NOTE: sourceHost and proxyHost:
     * were put in place to account for requests who have the X-Forwarded-For header
     * sourceHost would be the IP detailed in the X-Forwarded-For header
     * proxyHost would be what ever req.getRemoteHost returns (which is always the last node that sent the request which in this case is the proxy)
     * in cases without proxies, sourceHost would be req.getRemoteHost and proxyHost would be null
     */
    {
      class: 'String',
      name: 'sourceHost',
    },
    {
      class: 'String',
      name: 'proxyHost'
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
    }
  ]
});
