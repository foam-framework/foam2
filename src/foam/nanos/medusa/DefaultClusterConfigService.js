/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'DefaultClusterConfigService',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.medusa.ClusterConfigService',
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.core.Agency',
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
    }
  ],

  methods: [
    {
      documentation: `Upon initialization create the ClusterServer configuration and register nSpec.`,
      name: 'start',
      javaCode: `
      ((Agency) getX().get("threadPool")).submit(getX(), this, getClass().getSimpleName());
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        logger.debug(this.getClass().getSimpleName(), "execute");

        DAO dao = (DAO) getX().get("localClusterConfigDAO");
        ClusterConfig config = (ClusterConfig) dao.find(getConfigId());
        if ( config != null ) {
          config = (ClusterConfig) config.fclone();
          config.setStatus(Status.ONLINE);
          config = (ClusterConfig) dao.put(config);

          // NOTE: Initial dissolve will be triggered by ClusterConfigMonitor
          //((ElectoralService) getX().get("electoralService")).dissolve(x);
        } else {
          ((Logger) getX().get("logger")).warning("ClusterConfig not found", getConfigId());
        }
        // TODO/REVIEW: Optionally run as cronjob or timertask if cronjobs are not available on secondaries
        //getX().get("clusterConfigMonitor");
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
        }
        return pDao;
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
      name: 'getVoters',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaType: `java.util.List`,
      javaCode: `
      ClusterConfig config = getConfig(x, getConfigId());
      List arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            getVoterPredicate(x),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          )
        )
        .select(new ArraySink())).getArray();
      return arr;
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
    },
    {
      documentation: 'Are at least half+1 of the expected instances online?',
      name: 'hasQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Boolean',
      javaCode: `
      int online = 0;
      List<ClusterConfig> voters = getVoters(x);
      for ( ClusterConfig voter : voters ) {
        if ( voter.getStatus() == Status.ONLINE ) {
          online += 1;
        }
      }
      return online >= voters.size() / 2 + 1;
      `
    },
  ]
});
