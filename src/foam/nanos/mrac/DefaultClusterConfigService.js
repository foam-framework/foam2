/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'DefaultClusterConfigService',

  implements: [
    'foam.nanos.mrac.ClusterConfigService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.RetryBox',
    'foam.box.SessionClientBox',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Logger',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.List',
    'java.util.ArrayList',
  ],

  properties: [
    {
      documentation: 'URL path prefix',
      name: 'path',
      class: 'String',
      value: 'service'
    },
    {
      name: 'serviceName',
      class: 'String',
      value: 'cluster'
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.nanos.mrac.ClusterConfig'
    },
    {
      name: 'primaryConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.mrac.ClusterConfig'
    },
    {
      name: 'isPrimary',
      class: 'Boolean',
      value: false
    },
    {
      name: 'primaryDAOs',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new java.util.HashMap();'
    },
    {
      name: 'clusterConfigDAO',
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return (foam.dao.DAO) getX().get("localClusterConfigDAO");'
    }
  ],

  methods: [
    {
      documentation: `Upon initialization create the ClusterServer configuration and register nSpec.`,
      name: 'init_',
      javaCode: `
        /* register ClusterConfig Listener */
        DAO clusterConfigDAO = getClusterConfigDAO();
        clusterConfigDAO.listen(new ClusterConfigSink(getX(), this), TRUE);
        onDAOUpdate(getX());
      `
    },
    {
      name: 'buildURL',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        },
        {
          name: 'config',
          type: 'foam.nanos.mrac.ClusterConfig'
        },
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        String path = getPath();
        if ( ! SafetyUtil.isEmpty(path) ) {
          path = "/" + path;
        }
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getPort(), path+"/"+serviceName, null, null);
logger.debug(this.getClass().getSimpleName(), "buildURL", serviceName, uri.toURL().toString());
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        ((Logger) getX().get("logger")).error(e);
        return ""; // TODO:
      }
      `
    },
    {
      name: 'getPrimaryDAO',
      javaCode: `
        DAO pDao = (DAO) getPrimaryDAOs().get(getServiceName());
        if ( pDao == null ) {
          ClusterConfig primaryConfig = getPrimaryConfig();
          ClusterConfig config = getConfig();
          pDao = new ClientDAO.Builder(x)
                   .setDelegate(new SessionClientBox.Builder(x)
                     .setSessionID(config.getSessionId())
                     .setDelegate(new RetryBox.Builder(x)
                       .setDelegate(new HTTPBox.Builder(x)
                         .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
                         .setSessionID(config.getSessionId())
                         .setUrl(buildURL(x, getServiceName(), primaryConfig))
                         .build()
                       )
                       .build()
                     )
                     .build()
                  )
                  .build();
          getPrimaryDAOs().put(getServiceName(), pDao);
        }
        return pDao;
      `
    },
    {
      documentation: `Rebuild the client list.`,
      name: 'onDAOUpdate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      logger.debug(this.getClass().getSimpleName(), "onDAOUpdate");
      String hostname = System.getProperty("hostname", "localhost");
      DAO dao = getClusterConfigDAO();
      ClusterConfig config = (ClusterConfig) dao.find(hostname);
      if ( config == null ) {
        logger.error(this.getClass().getSimpleName(), "onDAOUpdate", "cluster configuration not found for", hostname);
        return;
      }
      setConfig(config);

      List andPredicates = new ArrayList();
      if ( ! SafetyUtil.isEmpty(config.getRealm()) ) {
        andPredicates.add(EQ(ClusterConfig.REALM, config.getRealm()));
      }
      if ( ! SafetyUtil.isEmpty(config.getRegion()) ) {
        andPredicates.add(EQ(ClusterConfig.REGION, config.getRegion()));
      }
      andPredicates.add(EQ(ClusterConfig.ENABLED, true));
      andPredicates.add(EQ(ClusterConfig.STATUS, Status.ONLINE));
      List configs = (ArrayList) ((ArraySink) getClusterConfigDAO()
        .where(AND((Predicate[]) andPredicates.toArray(new Predicate[andPredicates.size()])))
        .select(new ArraySink())).getArray();

      List<DAO> newClients = new ArrayList<DAO>();
      for ( Object c : configs ) {
        ClusterConfig clientConfig = (ClusterConfig) c;
        if ( clientConfig.getNodeType() == NodeType.PRIMARY ) {
          setPrimaryConfig(clientConfig);
        }
      }

      if ( config.getNodeType().equals(NodeType.PRIMARY) &&
        getPrimaryConfig() == null ) {
        logger.error(this.getClass().getSimpleName(), "onDAOUpdate", "cluster configuration for PRIMARY not found.");
      }
      setIsPrimary(config.equals(getPrimaryConfig()));

      getPrimaryDAOs().clear();
      `
    }
  ]
});
