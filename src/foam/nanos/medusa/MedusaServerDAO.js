/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'process each MedusaEntry operation',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  /**
   * Configure context with user and agent
   */
  public X applyTo(X x, String sessionId) {
    getLogger().debug("applyTo", this);

    DAO userDAO = (DAO) x.get("localUserDAO");
    AuthService auth  = (AuthService) x.get("auth");
    X y = x;
    y = y.put("logger", x.get("logger"));

    if ( sessionId != null ) {
      DAO sessionDAO = (DAO) y.get("localSessionDAO");
      Session session = (Session) sessionDAO.find(sessionId);
      if ( session != null ) {

        User user = (User) userDAO.find(session.getUserId());
        if ( user != null ) {
          y = y.put("user", user);
        } else if ( session.getUserId() > 0 ) {
          getLogger().error("applyTo", "User not found.", session.getUserId(), this);
        }

        User agent = (User) userDAO.find(session.getAgentId());
        if ( agent != null ) {
          y = y.put("agent", agent);
        } else if ( session.getAgentId() > 0 ) {
          getLogger().error("applyTo", "Agent not found.", session.getAgentId(), this);
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
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;

      // already processed.
      if ( ! SafetyUtil.isEmpty(entry.getHash()) ) {
        MedusaEntry old = (MedusaEntry) getDelegate().find_(x, entry.getId());
        if ( ! entry.getHasConsensus() ) {
          return getDelegate().put_(x, entry);
        }
        getLogger().debug("discard", "has consensus", entry.getIndex(), entry.getMediator(), entry.getNode());
        return entry;
      }
      
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      ClusterConfig primary = support.getPrimary(x);

      ElectoralServiceServer electoralService = (ElectoralServiceServer) x.get("electoralService");

      getLogger().debug("put", config.getName(), "primary", primary.getName(), config.getStatus().getLabel(), "electoral state", electoralService.getState().getLabel());

      if ( ! config.getIsPrimary() ) {
        throw new UnsupportedOperationException("Cluster command not supported on non-primary instance");
      }
      if ( config.getStatus() != Status.ONLINE ) {
        throw new IllegalStateException("Cluster Server not ready.");
      }

//      X y = applyTo(x, entry.getSessionId());
      X y = x;
      DAO dao = (DAO) y.get(entry.getNSpecName());
      if ( dao == null ) {
        getLogger().error("DAO not found.", entry.getNSpecName());
        throw new RuntimeException("Service not found: "+entry.getNSpecName());
      }
//      dao = dao.inX(y);

      // TODO: cache and see RoutingDAO.
      dao = (DAO) dao.cmd_(y, MDAO.GET_MDAO_CMD);
      if ( dao == null ) {
        getLogger().error("MDAO not found.", entry.getNSpecName());
        throw new RuntimeException("MDAO not found: "+entry.getNSpecName());
      }

      // foam.core.FObject nu = y.create(foam.lib.json.JSONParser.class).parseString(entry.getData());
      // if ( nu == null ) {
      //   getLogger().error("Failed to parse", entry.getData());
      //   throw new RuntimeException("Error parsing data.");
      // }

      // foam.core.FObject old = dao.find_(y, nu.getProperty("id"));
      // if (  old != null ) {
      //   nu = old.fclone().copyFrom(nu);
      // }

      foam.core.FObject nu = entry.getData();
      if ( DOP.PUT == entry.getDop() ) {
        nu = dao.put_(y, nu);
      } else if ( DOP.REMOVE == entry.getDop() ) {
        nu = dao.remove_(y, nu);
      } else {
        getLogger().warning("Unsupported operation", entry.getDop().getLabel());
        throw new UnsupportedOperationException(entry.getDop().getLabel());
      }
      entry.setData(nu);
      return getDelegate().put_(x, entry);
      `
    }
  ]
});
