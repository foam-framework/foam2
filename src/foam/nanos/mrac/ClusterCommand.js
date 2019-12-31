/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterCommand',

  documentation: `Container for marshalling DAO operation to primary cluster instance.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.session.Session'
  ],

  constants: [
    {
      name: 'PUT',
      type: 'String',
      value: 'put'
    },
    {
      name: 'REMOVE',
      type: 'String',
      value: 'remove'
    },
    {
      name: 'CMD',
      type: 'String',
      value: 'cmd'
    },
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String'
    },
    {
      name: 'command',
      class: 'String'
    },
    {
      name: 'obj',
      class: 'String'
    },
    {
      name: 'sessionId',
      class: 'String'
    },
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "remote");'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ClusterCommand(X x, String serviceName, String command, String obj) {
    setServiceName(serviceName);
    setCommand(command);
    setObj(obj);

    User user = (User) x.get("user");
    User sessionUser = user;
    User agent = (User) x.get("agent");
    if ( agent != null ) {
     sessionUser = agent;
    }

    if ( sessionUser != null && sessionUser.getId() > 1 ) {
      DAO sessionDAO = (DAO) x.get("sessionDAO");
      Session session = (Session) sessionDAO.find(EQ(Session.USER_ID, sessionUser.getId()));
      if ( session != null ) {
        setSessionId(session.getId());
      }
    }
  }

  /**
   * Configure context with user and agent
   */
  public X applyTo(X x) {
    Logger logger = new PrefixLogger(new Object[] {getHostname()}, (Logger) x.get("logger"));
    logger.debug(this.getClass().getSimpleName(), "applyTo", this);

    DAO userDAO = (DAO) x.get("localUserDAO");
    AuthService auth  = (AuthService) x.get("auth");
    X y = x;
    y = y.put("logger", logger);

    if ( getSessionId() != null ) {
      DAO sessionDAO = (DAO) y.get("localSessionDAO");
      Session session = (Session) sessionDAO.find(getSessionId());
      if ( session != null ) {

        User user = (User) userDAO.find(session.getUserId());
        if ( user != null ) {
          y = y.put("user", user);
        } else if ( session.getUserId() > 0 ) {
          logger.error(this.getClass().getSimpleName(), "User not found.", session.getUserId(), this);
        }

        User agent = (User) userDAO.find(session.getAgentId());
        if ( agent != null ) {
          y = y.put("agent", agent);
        } else if ( session.getAgentId() > 0 ) {
          logger.error(this.getClass().getSimpleName(), "Agent not found.", session.getAgentId(), this);
        }

        Group group = auth.getCurrentGroup(y);
        y = y.put("group", group);
        y = y.put("appConfig", group.getAppConfig(y));
      }
    }
    return y;
  }
          `
        }));
      }
    }
  ]
});
