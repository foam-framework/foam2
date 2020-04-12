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
    'java.util.List'
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
      javaSetter: `
      Status old = status_;
      status_ = val;
      DAO dao = (DAO) getX().get("localClusterConfigDAO");
      ClusterConfig config = (ClusterConfig) dao.find(getConfigId());
      if ( status_ == Status.ONLINE &&
           config.getStatus() == Status.OFFLINE ) {
        config = (ClusterConfig) config.fclone();
        config.setStatus(Status.ONLINE);
        config = (ClusterConfig) dao.put(config);
      } if ( status_ == Status.OFFLINE &&
           config.getStatus() == Status.ONLINE ) {
        config = (ClusterConfig) config.fclone();
        config.setStatus(Status.OFFLINE);
        config = (ClusterConfig) dao.put(config);
      }
      `
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
      name: 'replayBatchTimerInterval',
      class: 'Long',
      value: 16
    },
    {
      name: 'primaryDAOs',
      class: 'Map',
      visibility: 'HIDDEN',
      javaFactory: 'return new java.util.HashMap();'
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

        java.net.URI uri = new java.net.URI("http", null, address, config.getPort(), path.toString(), query, fragment);

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
        DAO dao = (DAO) getPrimaryDAOs().get(serviceName);
        if ( dao == null ) {
          ClusterConfig primaryConfig = getConfig(x, getPrimaryConfigId());
          ClusterConfig config = getConfig(x, getConfigId());
          dao = getClientDAO(x, serviceName, config, primaryConfig);
          getPrimaryDAOs().put(serviceName, dao);
        }
        return dao;
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
      name: 'getMediatorCount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      Count count = (Count) ((DAO) x.get("localClusterConfigDAO"))
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
      name: 'getMediatorQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      return getMediatorCount(x) / 2 + 1;
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
      name: 'getNodeCount',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      Count count = (Count) ((DAO) x.get("localClusterConfigDAO"))
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
      name: 'getNodeQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
      javaCode: `
      return getNodeCount(x) / 2 + 1;
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
      return new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sendClusterConfig.getSessionId())
          .setDelegate(new PMBox.Builder(x)
            .setClassType(MedusaEntry.getOwnClassInfo())
            .setName("ClientDAO:"+sendClusterConfig.getName()+":"+getServiceName() +":"+receiveClusterConfig.getName())
            .setDelegate(new ClusterHTTPBox.Builder(x)
              .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
              .setSessionID(sendClusterConfig.getSessionId())
              .setUrl(buildURL(x, serviceName, null, null, receiveClusterConfig))
              .build())
            .build())
          .build())
        .build();
      `
    }
  ]
});
