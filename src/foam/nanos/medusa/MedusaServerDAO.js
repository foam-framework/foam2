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
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'foam.lib.json.Outputter',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.Map',
    'java.util.HashMap',
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

      getLogger().debug("put", config.getName(), "primary", primary.getName(), config.getStatus().getLabel());

      if ( ! config.getIsPrimary() ) {
        throw new UnsupportedOperationException("Cluster command not supported on non-primary instance");
      }
      if ( config.getStatus() != Status.ONLINE ) {
        throw new IllegalStateException("Cluster Server not ready.");
      }

      if ( SafetyUtil.isEmpty(entry.getData()) ) {
        return getDelegate().put_(x, entry);
      }

      FObject nu = x.create(JSONParser.class).parseString(entry.getData());
      if ( nu == null ) {
        getLogger().error("Failed to parse", entry.getData());
        throw new RuntimeException("Error parsing data.");
      }

      DAO dao = support.getMdao(x, entry);
      FObject old = dao.find_(x, nu.getProperty("id"));
      if (  old != null ) {
        nu = old.fclone().copyFrom(nu);
      }

      if ( DOP.PUT == entry.getDop() ) {
        nu = dao.put_(x, nu);
      } else if ( DOP.REMOVE == entry.getDop() ) {
        nu = dao.remove_(x, nu);
      } else {
        getLogger().warning("Unsupported operation", entry.getDop().getLabel());
        throw new UnsupportedOperationException(entry.getDop().getLabel());
      }

      Outputter outputter = new Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
      String data = ( old != null ) ?
        outputter.stringifyDelta(old, nu) :
        outputter.stringify(nu);
      entry.setData(data);

      return getDelegate().put_(x, entry);
      `
    }
  ]
});
