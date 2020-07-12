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

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.SessionClientBox',
    'foam.box.socket.SocketClientBox',
    'foam.box.socket.SocketServer',
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
    'foam.nanos.om.OMBox',
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
      name: 'configName',
      label: 'Self',
      class: 'String',
      javaFactory: 'return getConfig(getX(), getConfigId()).getName();',
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
      value: 'threadPool'
//      value: 'medusaThreadPool'
    },
    {
      name: 'batchTimerInterval',
      class: 'Long',
      value: 10
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
            EQ(ClusterConfig.ZONE, Math.max(0, config.getZone() -1)),
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
      name: 'mediatorQuorum',
      class: 'Int',
      javaFactory: `
      return getMediatorCount() / 2 + 1;
      `
    },
    {
      documentation: 'Are at least half+1 of the expected nodes online?',
      name: 'hasMediatorQuorum',
      class: 'Boolean',
      visibility: 'RO',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L), //Math.max(0, config.getZone() -1)),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion())
          ))
        .select(COUNT());
      return ((Long)count.getValue()).intValue() >= getMediatorQuorum();
      `
    },
    {
      documentation: 'Enable and Online nodes in each bucket to achieve quorum',
      name: 'nodeQuorum',
      class: 'Int',
      value: 2
    },
    {
      documentation: 'Additional node redundancy in each bucket.',
      name: 'nodeRedundancy',
      class: 'Int',
      value: 0,
    },
    {
      name: 'nodeGroups',
      class: 'Int',
      expression: function(nodeQuorum, nodeRedundancy) {
        return this.nodeCount / (nodeQuorum + nodeRedundancy);
      },
      javaFactory: `
      return getNodeCount() / (getNodeQuorum() + getNodeRedundancy());
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
      name: 'nodeBuckets',
      class: 'Map',
      javaFactory: `
      return new HashMap();
     `,
      visibility: 'RO'
    },
    {
      documentation: 'Are at least half+1 of the expected nodes online?',
      name: 'hasNodeQuorum',
      class: 'Boolean',
      visibility: 'RO',
      javaFactory: `
      int quorumCount = getNodeQuorum();
      Map buckets = getNodeBuckets();
      if ( buckets.size() < getNodeGroups() ) {
        getLogger().warning("hasNodeQuorum", "false", "insufficient buckets", buckets.size(), "threshold", getNodeGroups());
        return false;
      }
      for ( int i = 0; i < buckets.size(); i++ ) {
        List bucket = (List) buckets.get(i);
        if ( bucket.size() < quorumCount ) {
          getLogger().warning("hasNodeQuorum", "false", "insufficient nodes in bucket", "buckets", bucket.size(), "threshold", quorumCount);
          return false;
        }
        int count = 0;
        for ( int j = 0; j < bucket.size(); j++ ) {
          ClusterConfig config = getConfig(getX(), (String) bucket.get(j));
          if ( config.getStatus() == Status.ONLINE ) {
            count += 1;
          }
        }
        if ( count < quorumCount ) {
           getLogger().warning("hasNodeQuorum", "false", "insufficient ONLINE nodes in bucket", "bucket", i, "count", count, "threshold", quorumCount);
          return false;
        }
      }
      getLogger().debug("hasNodeQuorum", "true");
      return true;
      `
    },
    {
      documentation: 'A single instance is using the medusa journal. No other clustering features are used.',
      name: 'standAlone',
      class: 'Boolean',
      visibility: 'RO',
      javaFactory: `
      if ( getMediatorCount() == 1 ) {
        ClusterConfig config = getConfig(getX(), getConfigId());
        return config.getType() == MedusaType.MEDIATOR &&
               config.getZone() == 0L;
      }
      return false;
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
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      ReplayingInfo replaying = (ReplayingInfo) getX().get("replayingInfo");
      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      ClusterConfig myConfig = (ClusterConfig) dao.find(getConfigId()).fclone();
      myConfig.setReplayingInfo(replaying);
      dao.put(myConfig);
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
      name: 'getSocketClientBox',
      type: 'SocketClientBox',
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
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'foam.nanos.medusa.ClusterConfig'
        },
      ],
      javaCode: `
        String address = receiveClusterConfig.getId();
        DAO hostDAO = (DAO) x.get("hostDAO");
        Host host = (Host) hostDAO.find(address);
        if ( host != null ) {
          address = host.getAddress();
        }
        getLogger().debug("getSocketClientBox", serviceName, address, host, receiveClusterConfig.getPort());
        SocketClientBox clientBox = new SocketClientBox();
        clientBox.setX(x);
        clientBox.setHost(address);
        clientBox.setPort(receiveClusterConfig.getPort() + SocketServer.PORT_OFFSET);
        clientBox.setServiceName(serviceName);
        return clientBox;
      `
    },
    {
      name: 'getTransportlayerBox',
      type: 'Box',
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
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'receiveClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'useTCP',
          type: 'Boolean',
          value: true
        }
      ],
      javaCode: `
        if ( useTCP == true ) {
          return getSocketClientBox(x, serviceName, sendClusterConfig, receiveClusterConfig);
        } else {
          return new ClusterHTTPBox.Builder(x)
                  .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
                  .setSessionID(sendClusterConfig.getSessionId())
                  .setUrl(buildURL(x, serviceName, null, null, receiveClusterConfig))
                  .build();
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
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(id);
      if ( config != null ) {
        return (ClusterConfig) config.fclone();
      }
      getLogger().error("ClusterConfig not found:", id);
      throw new RuntimeException("ClusterConfig not found: "+id);
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
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true),
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
      documentation: 'Are at least half+1 of the expected instances online?',
      name: 'hasQuorum',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      return getHasNodeQuorum() &&
             getHasMediatorQuorum() &&
             ! ((ReplayingInfo) x.get("replayingInfo")).getReplaying();
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
      // if ( sendClusterConfig.getId().equals(receiveClusterConfig.getId()) ) {
      //   // short circuit
      //   getLogger().debug("getClientDAO", "short circuit", sendClusterConfig.getId(), receiveClusterConfig.getId());
      //   client = new ClusterServerDAO(x);
      // } else {
        client = new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(new PMBox.Builder(x)
            .setClassType(ClientDAO.getOwnClassInfo())
            .setName(id)
            .setDelegate(getTransportlayerBox(x, serviceName, sendClusterConfig, receiveClusterConfig, true))
            .build())
          .build())
        .build();
      // }
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
      try {
        return getPrimary(x);
      } catch ( RuntimeException t ) {
        // if in standalone mode, just route to self if only one mediator enabled.
        getLogger().debug("getNextServerConfig", t.getMessage(), getMediatorCount());
        if ( getMediatorCount() == 1 ) {
          return config;
        }
        throw t;
      }
      `
    },
    {
      // TODO/REVIEW: Cron itself needs better cluster support
      // we can't have the same crons running everywhere.
      name: 'cronEnabled',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      javaCode: `
      try {
        ClusterConfig config = getConfig(x, getConfigId());
        if ( config == null ) {
          return true;
        }
        if ( config.getType() == MedusaType.MEDIATOR ) {
          if ( getMediatorCount() == 1 ) {
            return true;
          }
          if ( config.getIsPrimary() &&
               config.getStatus() == Status.ONLINE &&
               config.getZone() == 0L ) {
            return true;
          }
          if ( config.getStatus() == Status.ONLINE &&
               config.getZone() > 0L ) {
            return true;
          }
          return false;
        }
        if ( config.getType() == MedusaType.NODE ) {
          return false;
        }
      } catch (Throwable t) {
        // ignore, thrown when no config found.
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

        getLogger().debug("mdao", "cache", serviceName);
        return dao;
      }
      if ( obj != null &&
           ! ( obj instanceof DAO ) ) {
        getLogger().error("getMdao" ,serviceName, "not instance of dao", obj.getClass().getSimpleName());
      }
      dao = (DAO) x.get(serviceName);
      // look for 'local' version
      String key = serviceName;
      if ( ! key.startsWith("local") ) {
        key = "local" + serviceName.substring(0,1).toUpperCase()+serviceName.substring(1);
        if ( x.get(key) != null ) {
          dao = (DAO) x.get(key);
          getLogger().debug("mdao", "local", serviceName, key);
        }
      }
      try {
      Object result = dao.cmd(MDAO.GET_MDAO_CMD);
      if ( result != null &&
           result instanceof DAO ) {
        getLogger().debug("mdao", "cmd", serviceName, dao.getClass().getSimpleName(), dao.getOf().getId());
        dao = (DAO) result;
      } else {
        while ( dao != null ) {
          getLogger().debug("mdao", "while", serviceName, dao.getClass().getSimpleName(), dao.getOf().getId());
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
        getLogger().debug("mdao", "found", serviceName, dao.getClass().getSimpleName(), dao.getOf().getId());
        return dao;
      }
      } catch (Throwable t) {
        getLogger().error("mdao", serviceName, key, t.getMessage(), t);
      }
      throw new IllegalArgumentException("MDAO not found: "+serviceName);
      `
    },
  ]
});
