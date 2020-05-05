/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigSupport',

  documentation: `Support service from which an instance may inquire it\'s
cluster type - such as primary. It also provides access to
configuration for contacting the primary node.`,

  axioms: [
    foam.pattern.Singleton.create()
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.SessionClientBox',
    'foam.core.Agency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'static foam.mlang.MLang.*',
    'static foam.mlang.MLang.COUNT',
    'foam.mlang.sink.Count',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PMBox',
    'foam.net.Host',
    'foam.util.SafetyUtil',
    'java.net.HttpURLConnection',
    'java.net.URL',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
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
      name: 'hashingEnabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'configId',
      label: 'Self',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");',
      visibility: 'RO'
    },
    {
      name: 'primaryConfigId',
      label: 'Primary',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'isPrimary',
      class: 'Boolean',
      value: false,
      visibility: 'RO'
    },
    {
      documentation: 'Setting instance to true (ONLINE) will make this instance visible to the cluster.',
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.medusa.Status',
      value: 'OFFLINE',
      visibility: 'RO'
    },
    {
      name: 'isReplaying',
      class: 'Boolean',
      value: true,
      visibility: 'RO'
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'medusaThreadPool'
    },
    {
      name: 'batchTimerInterval',
      class: 'Long',
      value: 1
    },
    {
      name: 'maxBatchSize',
      class: 'Long',
      value: 1000
    },
    {
      name: 'clients',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new java.util.HashMap();'
    },
    {
      name: 'mdaos',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
    },
    {
      documentation: 'see ClusterConfigSupportDAO',
      name: 'mediatorCount',
      class: 'Int',
      visibility: 'RO',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ))
        .select(COUNT());
      return ((Long)count.getValue()).intValue();
      `
    },
    {
      documentation: 'see ClusterConfigSupportDAO',
      name: 'nodeCount',
      class: 'Int',
      visibility: 'RO',
      javaFactory: `
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(COUNT());
      return ((Long)count.getValue()).intValue();
      `
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
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
          name: 'query',
          type: 'String'
        },
        {
          name: 'fragment',
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
        String address = config.getId();
        DAO hostDAO = (DAO) x.get("hostDAO");
        Host host = (Host) hostDAO.find(config.getId());
        if ( host != null ) {
          address = host.getAddress();
        }

        StringBuilder path = new StringBuilder();
        path.append("/");
        path.append(getPath());
        path.append("/");
        path.append(serviceName);

        String scheme = config.getUseHttps() ? "https" : "http";
        java.net.URI uri = new java.net.URI(scheme, null, address, config.getPort(), path.toString(), query, fragment);

        // getLogger.debug("buildURL", serviceName, uri.toURL().toString());
        return uri.toURL().toString();
      } catch (java.net.MalformedURLException | java.net.URISyntaxException e) {
        getLogger().error(e);
        throw new RuntimeException(e);
      }
      `
    },
    {
      name: 'getPrimaryDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      return getClientDAO(x, serviceName, getConfig(x, getConfigId()), getPrimary(x));
      `
    },
    {
      name: 'getPrimary',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      ClusterConfig primaryConfig = null;
      DAO clusterConfigDAO = (DAO) x.get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.IS_PRIMARY, true),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(new ArraySink())).getArray();
      if ( configs.size() > 0 ) {
        primaryConfig = configs.get(0);
        if ( configs.size() > 1 ) {
          getLogger().error("muliple primaries", configs.get(0), configs.get(1));
          throw new RuntimeException("Multiple primaries found.");
        }
        return primaryConfig;
      } else {
        throw new RuntimeException("Primary not found.");
      }
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
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      return (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(id).fclone();
     `
    },
    {
      documentation: 'Any active region in realm.',
      name: 'getActiveRegionConfig',
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
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      DAO clusterConfigDAO = (DAO) x.get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
//            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        // send to outermost zone.
        .orderBy(foam.mlang.MLang.DESC(ClusterConfig.ZONE))
//        .orderBy(ClusterConfig.IS_PRIMARY)
        .select(new ArraySink())).getArray();
      if ( configs.size() > 0 ) {
        // TODO: random or round-robin.
        // Ordered by IS_PRIMARY if any are.
        return configs.get(configs.size() -1);
      } else {
        throw new RuntimeException("Active Region not found.");
      }
      `
    },
    {
      documentation: 'Any active region in realm.',
      name: 'getNextZoneConfig',
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
      type: 'foam.nanos.medusa.ClusterConfig',
      javaCode: `
      long zone = config.getZone();
      while ( zone > 0 ) {
        zone -= 1;
        DAO clusterConfigDAO = (DAO) x.get("clusterConfigDAO");
        List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
          .where(
            AND(
              EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
              EQ(ClusterConfig.REALM, config.getRealm()),
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.ZONE, zone),
              EQ(ClusterConfig.STATUS, Status.ONLINE),
              EQ(ClusterConfig.ENABLED, true)
            ))
          .orderBy(foam.mlang.MLang.DESC(ClusterConfig.IS_PRIMARY))
          .select(new ArraySink())).getArray();
        if ( configs.size() > 0 ) {
          return configs.get(configs.size() -1);
        }
      }
      throw new RuntimeException("Next Zone not found.");
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
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.ZONE, 0L),
              EQ(ClusterConfig.STATUS, Status.ONLINE),
              EQ(ClusterConfig.ENABLED, true)
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
      name: 'getMediatorQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      return getMediatorCount() / 2 + 1;
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
      return getVoters(x).size() >= getMediatorQuorum(x);
      `
    },
    {
      name: 'getNodeQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      return getNodeCount() / 2 + 1;
      `
    },
    {
      documentation: 'Are at least half+1 of the expected nodes online?',
      name: 'hasNodeQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Boolean',
      javaCode: `
       Count count = (Count) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true)
          ))
        .select(COUNT());
      return ((Long)count.getValue()).intValue() >= getNodeQuorum(x);
      `
    },
    {
      name: 'getClientDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String',
        },
        {
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'ClusterConfig'
        }
      ],
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append(sendClusterConfig.getName());
      sb.append(":");
      sb.append(serviceName);
      sb.append(":");
      sb.append(receiveClusterConfig.getName());
      String id = sb.toString();
      DAO client = (DAO) getClients().get(id);
      if ( client != null ) {
        return client;
      }
      client = new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(new PMBox.Builder(x)
            .setClassType(MedusaEntry.getOwnClassInfo())
            .setName("ClientDAO:"+id)
            .setDelegate(new ClusterHTTPBox.Builder(x)
              .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
              .setSessionID(sendClusterConfig.getSessionId())
              .setUrl(buildURL(x, serviceName, null, null, receiveClusterConfig))
              .build())
            .build())
          .build())
        .build();
      getClients().put(id, client);
      return client;
      `
    },
    {
      documentation: 'determine the next server to route request to.',
      name: 'getNextServerConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'ClusterConfig',
      javaCode: `
      DAO dao = (DAO) x.get("localClusterConfigDAO");
      ClusterConfig config = (ClusterConfig) dao.find(getConfigId());

      // standby region -> active region
      if ( config.getRegionStatus() != RegionStatus.ACTIVE ) {
        return getActiveRegionConfig(x, config);
      }

      // active region, zone # -> zone # -1 (primary if known)
      if ( config.getZone() > 0 ) {
        return getNextZoneConfig(x, config);
      }

      // route to primary
      return getPrimary(x);
      `
    },
    {
      name: 'cronEnabled',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
      ClusterConfig config = getConfig(x, getConfigId());
      if ( config.getType() == MedusaType.MEDIATOR ) {
        if ( config.getIsPrimary() &&
             config.getStatus() == Status.ONLINE &&
             config.getZone() == 0L ) {
          return true;
        }
        return false;
      }
      if ( config.getType() == MedusaType.NODE ) {
        return false;
      }
      return true;
     `
    },
    {
      name: 'getMdao',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      getLogger().debug("mdao", serviceName);
      Object obj = getMdaos().get(serviceName);
      DAO dao;
// REVIEW: periodically the result returned from get is a Map.
//      DAO dao = (DAO) getMdaos().get(serviceName);
//      if ( dao != null ) {
      if ( obj != null &&
           obj instanceof DAO ) {
        dao = (DAO) obj;

        getLogger().debug("mdao", serviceName, "cache", dao.getOf());
        return dao;
      }
      if ( obj != null &&
           ! ( obj instanceof DAO ) ) {
        getLogger().error("getMdao" ,serviceName, "not instance of dao", obj.getClass().getSimpleName());
      }
      dao = (DAO) x.get(serviceName);
      Object result = dao.cmd(MDAO.GET_MDAO_CMD);
      if ( result != null &&
           result instanceof MDAO ) {
        getLogger().debug("mdao", serviceName, "cmd", dao.getOf());
        dao = (DAO) result;
      } else {
        while ( dao != null ) {
          getLogger().debug("mdao", serviceName, "while", dao.getOf());
          if ( dao instanceof MDAO ) {
            break;
          }
          if ( dao instanceof EasyDAO ) {
            dao = ((EasyDAO) dao).getMdao();
            if ( dao != null ) {
              break;
            }
          }
          if ( dao instanceof ProxyDAO ) {
            dao = ((ProxyDAO) dao).getDelegate();
          } else {
            dao = null;
          }
        }
      }
      if ( dao != null ) {
        getMdaos().put(serviceName, dao);
        getLogger().debug("mdao", serviceName, "found", dao.getOf());
        return dao;
      }
      throw new IllegalArgumentException("MDAO not found: "+serviceName);
      `
    }
  ]
});
