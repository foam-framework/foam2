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
    'foam.dao.NotificationClientDAO',
    'foam.dao.ProxyDAO',
    'static foam.mlang.MLang.*',
    'static foam.mlang.MLang.COUNT',
    'foam.mlang.sink.Count',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
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
      // STANDALONE, SINGLE
      value: false,
      // value: true, // STANDALONE
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
      name: 'httpConnectTimeout',
      class: 'Int',
      value: 5000
    },
    {
      name: 'httpReadTimeout',
      class: 'Int',
      value: 10000
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
      documentation: 'Are at least half+1 of the expected mediators in zone 0 online?',
      name: 'hasMediatorQuorum',
      class: 'Boolean',
      visibility: 'RO',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
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
      documentation: 'Enabled and Online nodes in each bucket to achieve quorum',
      name: 'nodeQuorum',
      class: 'Int',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion()),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW)
          ))
        .select(COUNT());
      long c = count.getValue();
      if ( c < 4 ) {
        return 1;
      }
      if ( c < 7 ) {
        return 2;
      }
      if ( c < 10 ) {
        return 3;
      }
      if ( c < 15 ) {
        return 4;
      }
      return 5;
      `
    },
    {
      documentation: 'Additional node redundancy in each bucket.',
      name: 'nodeRedundancy',
      class: 'Int',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      Count count = (Count) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REALM, config.getRealm()),
            EQ(ClusterConfig.REGION, config.getRegion()),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW)
          ))
        .select(COUNT());
      long c = count.getValue();
      if ( c < 2 ) {
        return 0;
      }
      return 1;
      `
    },
    {
      name: 'nodeGroups',
      class: 'Int',
      expression: function(nodeQuorum, nodeRedundancy) {
        return this.nodeCount / (nodeQuorum + nodeRedundancy);
      },
      javaFactory: `
      return (int) Math.max(1, Math.floor(getNodeCount() / (getNodeQuorum() + Math.max(1, getNodeRedundancy()))));
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
        outputBuckets(getX());
        return false;
      }
      for ( int i = 0; i < buckets.size(); i++ ) {
        List bucket = (List) buckets.get(i);
        if ( bucket.size() < quorumCount ) {
          getLogger().warning("hasNodeQuorum", "false", "insufficient nodes in bucket", "buckets", bucket.size(), "threshold", quorumCount);
          outputBuckets(getX());
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
          outputBuckets(getX());
          return false;
        }
      }
      getLogger().debug("hasNodeQuorum", "true");
      return true;
      `
    },
    {
      documentation: 'Mediators to broadcast to. See ClusterConfigStatusDAO',
      name: 'broadcastMediators',
      class: 'FObjectArray',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfig myConfig = getConfig(getX(), getConfigId());
      long zone = myConfig.getZone() + 1;
      if ( myConfig.getType() == MedusaType.NODE ) {
        zone = myConfig.getZone();
      }
      // getLogger().debug("broadcastMediators", "zone", zone);
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) getX().get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ZONE, zone),
            OR(
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.TYPE, MedusaType.NERF)
            ),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
        .select(new ArraySink())).getArray();
      ClusterConfig[] configs = new ClusterConfig[arr.size()];
      arr.toArray(configs);
      return configs;
      `
    },
    {
      documentation: 'Any active region in realm.',
      name: 'nextZone',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      long zone = config.getZone();
      while ( zone > 0 ) {
        zone -= 1;
        DAO dao = (DAO) getX().get("clusterConfigDAO");
        dao = dao
          .where(
            AND(
              EQ(ClusterConfig.ENABLED, true),
              EQ(ClusterConfig.REALM, config.getRealm()),
              EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
              EQ(ClusterConfig.STATUS, Status.ONLINE),
              OR(
                EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
                EQ(ClusterConfig.TYPE, MedusaType.NERF)
              ),
              EQ(ClusterConfig.ZONE, zone)
            ));
        if ( zone == 0 ) {
          dao = dao.orderBy(foam.mlang.MLang.DESC(ClusterConfig.IS_PRIMARY));
        } else {
          dao = dao.orderBy(ClusterConfig.PING_TIME);
        }
        List<ClusterConfig> configs = ((ArraySink) dao.select(new ArraySink())).getArray();
        if ( configs.size() > 0 ) {
          // return configs.get(0);
          // return configs.get(configs.size() -1);
          ClusterConfig cfg = configs.get(0);
          getLogger().info("nextZone", "configs", configs.size(), "selected", cfg.getId(), cfg.getZone(), cfg.getIsPrimary(), cfg.getPingTime());
          for ( ClusterConfig c : configs ) {
            getLogger().info("nextZone", "other", c.getId(), c.getZone(), c.getIsPrimary(), c.getPingTime());
          }
          return cfg;
        }
      }
      throw new RuntimeException("Next Zone not found.");
      `
    },
    {
      documentation: 'determine the next server to route request to.',
      name: 'nextServer',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());

      // standby region -> active region
      if ( config.getRegionStatus() != RegionStatus.ACTIVE ) {
        return getActiveRegion();
      }

      // active region, zone # -> zone # -1 (primary if known)
      if ( config.getZone() > 0 ) {
        return getNextZone();
      }

      // route to primary
      try {
        return getPrimary(getX());
      } catch ( RuntimeException t ) {
        // if in standalone mode, just route to self if only one mediator enabled.
        if ( getStandAlone() ) {
          getLogger().debug("nextServer", t.getMessage(), "fallback to StandAlone");
          return config;
        }
        throw t;
      }
      `
    },
    {
      documentation: 'Any active region in realm.',
      name: 'activeRegion',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ClusterConfig',
      javaFactory: `
      ClusterConfig config = getConfig(getX(), getConfigId());
      DAO clusterConfigDAO = (DAO) getX().get("clusterConfigDAO");
      List<ClusterConfig> configs = ((ArraySink) clusterConfigDAO
        .where(
          AND(
            EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE),
            EQ(ClusterConfig.REALM, config.getRealm()),
            OR(
              EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
              EQ(ClusterConfig.TYPE, MedusaType.NERF)
            ),
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
        return configs.get(0);
      } else {
        throw new RuntimeException("Active Region not found.");
      }
      `
    },
    {
      documentation: 'A single instance is using the medusa journal. No other clustering features are used.',
      name: 'standAlone',
      class: 'Boolean',
//      value: true,
      value: false,
      visibility: 'RO'
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "buildURL");
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
      } finally {
        pm.log(x);
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
        }
      ],
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getSocketClientBox");
      try {
        String address = receiveClusterConfig.getId();
        DAO hostDAO = (DAO) x.get("hostDAO");
        Host host = (Host) hostDAO.find(address);
        if ( host != null ) {
          address = host.getAddress();
        }
        // getLogger().debug("getSocketClientBox", serviceName, address, host, receiveClusterConfig.getPort());
        SocketClientBox clientBox = new SocketClientBox();
        clientBox.setX(x);
        clientBox.setHost(address);
        clientBox.setPort(receiveClusterConfig.getPort() + SocketServer.PORT_OFFSET);
        clientBox.setServiceName(serviceName);
        return clientBox;
      } finally {
        pm.log(x);
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getPrimaryDAO");
      try {
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
      } finally {
        pm.log(x);
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getConfig");
      try {
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("localClusterConfigDAO")).find(id);
      if ( config != null ) {
        return (ClusterConfig) config.fclone();
      }
      getLogger().error("ClusterConfig not found:", id);
      throw new RuntimeException("ClusterConfig not found: "+id);
      } finally {
        pm.log(x);
      }
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getVoters");
      try {
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
      } finally {
        pm.log(x);
      }
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getClientDAO");
      try {
      return new ClientDAO.Builder(x)
        .setOf(MedusaEntry.getOwnClassInfo())
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(getSocketClientBox(x, serviceName, sendClusterConfig, receiveClusterConfig))
          .build())
        .build();
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'getHTTPClientDAO',
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getHTTPClientDAO");
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      try {
        return new foam.dao.ClientDAO.Builder(x)
          .setOf(MedusaEntry.getOwnClassInfo())
          .setDelegate(new foam.box.SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(new foam.box.HTTPBox.Builder(x)
            .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(sendClusterConfig.getSessionId())
            .setUrl(support.buildURL(x, serviceName, null, null, receiveClusterConfig))
            .setConnectTimeout(getHttpConnectTimeout())
            .setReadTimeout(getHttpReadTimeout())
            .build())
          .build())
        .build();
      } finally {
        pm.log(x);
      }
      `
    },
    {
      documentation: 'Notification client is send and forget, does not register a reply box.',
      name: 'getBroadcastClientDAO',
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
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getBroadcastClientDAO");
      try {
      return new NotificationClientDAO.Builder(x)
        .setOf(MedusaEntry.getOwnClassInfo())
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(getSocketClientBox(x, serviceName, sendClusterConfig, receiveClusterConfig))
          .build())
        .build();
      } finally {
        pm.log(x);
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
          // if ( config.getStatus() == Status.ONLINE &&
          //      config.getZone() > 0L ) {
          //   return true;
          // }
          return false;
        }
        if ( config.getType() == MedusaType.NODE ) {
          return false;
        }
        if ( config.getType() == MedusaType.NERF ) {
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
      // getLogger().debug("mdao", serviceName);
      Object obj = getMdaos().get(serviceName);
      DAO dao;
// REVIEW: periodically the result returned from get is a Map.
//      DAO dao = (DAO) getMdaos().get(serviceName);
//      if ( dao != null ) {
      if ( obj != null &&
           obj instanceof DAO ) {
        dao = (DAO) obj;

        // getLogger().debug("mdao", "cache", serviceName);
        return dao;
      }
      String key = serviceName;
      PM pm = PM.create(x, this.getClass().getSimpleName(), "getMdao");
      try {
        if ( obj != null &&
             ! ( obj instanceof DAO ) ) {
          getLogger().error("getMdao" ,serviceName, "not instance of dao", obj.getClass().getSimpleName());
        }
        dao = (DAO) x.get(serviceName);
        // look for 'local' version
        if ( ! key.startsWith("local") ) {
          key = "local" + serviceName.substring(0,1).toUpperCase()+serviceName.substring(1);
          if ( x.get(key) != null ) {
            dao = (DAO) x.get(key);
            getLogger().debug("mdao", "local", serviceName, key);
          }
        }
        if ( dao != null ) {
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
        }
      } catch (Throwable t) {
        getLogger().error("mdao", serviceName, key, t.getMessage(), t);
      } finally {
        pm.log(x);
      }
      throw new IllegalArgumentException("MDAO not found: "+serviceName);
      `
    },
    {
      name: 'outputBuckets',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      Map<Integer, List> buckets = getNodeBuckets();
      for ( int i = 0; i < buckets.size(); i++ ) {
        List bucket = (List) buckets.get(i);
        for ( int j = 0; j < bucket.size(); j++ ) {
          String id = (String) bucket.get(j);
          ClusterConfig node = getConfig(x, id);
          getLogger().info("buckets", buckets.size(), "bucket", i, id, node.getStatus());
        }
      }
      `
    },
    {
      documentation: 'Determine the number of nodes which contain and entry.',
      name: 'countEntryOnNodes',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'index',
          type: 'Long'
        }
      ],
      javaType: 'Long',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "countEntryOnNodes");

      Long count = 0L;
      try {
        List<ClusterConfig> configs = ((ArraySink) ((DAO) x.get("clusterConfigDAO"))
            .where(
                AND(
                    EQ(ClusterConfig.TYPE, MedusaType.NODE),
                    EQ(ClusterConfig.ZONE, 0L),
                    EQ(ClusterConfig.ENABLED, true)
                )
            )
            .select(new ArraySink())).getArray();
        for ( ClusterConfig config : configs ) {
          DAO client = getClientDAO(x, "medusaEntryDAO", config, config);
          MedusaEntry found = (MedusaEntry) client.find(index);
          if ( found != null ) {
            count++;
            getLogger().debug("countEntryOnNodes", config.getId(), index);
          }
        }
      } catch (Throwable t) {
        pm.error(x, t);
        getLogger().error(t);
        throw t;
      } finally {
        pm.log(x);
      }
      getLogger().info("countEntryOnNodes", "index", index, "count", count);
      return count;
      `
    },
  ]
});
