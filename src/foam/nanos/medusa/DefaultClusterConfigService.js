/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DefaultClusterConfigService',

  implements: [
    'foam.nanos.medusa.ClusterConfigService',
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
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
    'foam.nanos.medusa.quorum.QuorumService',
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
      name: 'configId',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      name: 'primaryConfigId',
      class: 'String',
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
    // {
    //   name: 'clusterConfigDAO',
    //   class: 'foam.dao.DAOProperty',
    //   javaFactory: 'return (foam.dao.DAO) getX().get("localClusterConfigDAO");'
    // }
  ],

  methods: [
    {
      documentation: `Upon initialization create the ClusterServer configuration and register nSpec.`,
//      name: 'init_',
      name: 'start',
      javaCode: `
        Logger logger = (Logger) getX().get("logger");
        logger.debug(this.getClass().getSimpleName(), "start");

        DAO dao = (DAO) getX().get("localClusterConfigDAO");
        ClusterConfig config = (ClusterConfig) dao.find(getConfigId());
        if ( config != null ) {
          config = (ClusterConfig) config.fclone();
          config.setStatus(Status.ONLINE);
          config = (ClusterConfig) dao.put(config);
          ((ElectoralService) getX().get("electoralService")).dissolve();
        } else {
          ((Logger) getX().get("logger")).warning("ClusterConfig not found", getConfigId());
        }
        // //register ClusterConfig Listener
        // clusterConfigDAO.listen(new ClusterConfigSink(getX(), this), TRUE);
        // onDAOUpdate(getX());
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
          type: 'foam.nanos.medusa.ClusterConfig'
        },
      ],
      javaCode: `
      try {
        // TODO: protocol - http will do for now as we are behind the load balancers.
        String path = getPath();
        if ( ! SafetyUtil.isEmpty(path) ) {
          path = "/" + path;
        }
        java.net.URI uri = new java.net.URI("http", null, config.getId(), config.getServicePort(), path+"/"+serviceName, null, null);
        // ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "buildURL", serviceName, uri.toURL().toString());
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
        DAO pDao = (DAO) getPrimaryDAOs().get(serviceName);
        if ( pDao == null ) {
          ClusterConfig primaryConfig = getConfig(x, getPrimaryConfigId());
          ClusterConfig config = getConfig(x, getConfigId());
          pDao = new ClientDAO.Builder(x)
                   .setDelegate(new SessionClientBox.Builder(x)
                     .setSessionID(config.getSessionId())
                     .setDelegate(new HTTPBox.Builder(x)
                       .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
                       .setSessionID(config.getSessionId())
                       .setUrl(buildURL(x, getServiceName(), primaryConfig))
                       .build())
                     .build())
                  .build();
          getPrimaryDAOs().put(serviceName, pDao);
          // ((Logger) x.get("logger")).debug("getPrimaryDAO", getPrimaryConfigId(), serviceName);
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
//nop
      // Logger logger = (Logger) x.get("logger");
      // logger.debug(this.getClass().getSimpleName(), "onDAOUpdate");
      // String hostname = System.getProperty("hostname", "localhost");
      // DAO dao = getClusterConfigDAO();
      // ClusterConfig config = (ClusterConfig) dao.find(hostname);
      // if ( config == null ) {
      //   logger.error(this.getClass().getSimpleName(), "onDAOUpdate", "cluster configuration not found for", hostname);
      //   return;
      // }
      // setConfig(config);

      // List andPredicates = new ArrayList();
      // if ( ! SafetyUtil.isEmpty(config.getRealm()) ) {
      //   andPredicates.add(EQ(ClusterConfig.REALM, config.getRealm()));
      // }
      // if ( ! SafetyUtil.isEmpty(config.getRegion()) ) {
      //   andPredicates.add(EQ(ClusterConfig.REGION, config.getRegion()));
      // }
      // andPredicates.add(EQ(ClusterConfig.ENABLED, true));
      // andPredicates.add(EQ(ClusterConfig.STATUS, Status.ONLINE));
      // List configs = (ArrayList) ((ArraySink) getClusterConfigDAO()
      //   .where(AND((Predicate[]) andPredicates.toArray(new Predicate[andPredicates.size()])))
      //   .select(new ArraySink())).getArray();

      // List<DAO> newClients = new ArrayList<DAO>();
      // for ( Object c : configs ) {
      //   ClusterConfig clientConfig = (ClusterConfig) c;
      //   if ( clientConfig.getNodeType() == NodeType.PRIMARY ) {
      //     setPrimaryConfig(clientConfig);
      //   }
      // }

      // if ( config.getNodeType().equals(NodeType.PRIMARY) &&
      //   getPrimaryConfig() == null ) {
      //   logger.error(this.getClass().getSimpleName(), "onDAOUpdate", "cluster configuration for PRIMARY not found.");
      // }
      // setIsPrimary(config.equals(getPrimaryConfig()));

      // getPrimaryDAOs().clear();
      `
    },
    {
      name: 'getVoterPredicate',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
    return AND(
              EQ(ClusterConfig.ENABLED, true),
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.ZONE, 0L)
           );
     `
    },
    {
      name: 'canVote',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ],
      javaCode: `
    return
      config.getEnabled() &&
      config.getType() == MedusaType.MEDIATOR &&
      config.getZone() == 0L;
      `
    },
    {
      name: 'getConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
      return (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(id).fclone();
     `
    },
   {
      name: 'addConnection',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaCode: `
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(getConfigId()).fclone();
      String[] old = config.getConnections();
      boolean found = false;
      for ( int i = 0; i < old.length; ++i) {
        if ( name.equals(old[i]) ) {
          found = true;
          break;
        }
      }
      if ( ! found ) {
        String[] nu = new String[old.length + 1];
        System.arraycopy(old, 0, nu, 0, old.length);
        nu[nu.length - 1] = name;
        config = (ClusterConfig) config.fclone();
        config.setConnections(nu);
        ((DAO) x.get("localClusterConfigDAO")).put(config);
      }
     `
    },
    {
      name: 'removeConnection',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaCode: `
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(getConfigId()).fclone();
      String[] old = config.getConnections();
      String[] nu = new String[old.length - 1];
      int c = 0;
      for ( int i = 0; i < old.length; ++i) {
        if ( name.equals(old[i]) ) {
          continue;
        }
        nu[c] = old[i];
        c++;
      }
      config.setConnections(nu);
      ((DAO) x.get("localClusterConfigDAO")).put(config);
     `
    }
  ]
});
