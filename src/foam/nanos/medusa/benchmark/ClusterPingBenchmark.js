/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.benchmark',
  name: 'ClusterPingBenchmark',
  implements: [ 'foam.nanos.bench.Benchmark' ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Language',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.boot.NSpec',
    'foam.nanos.http.Ping',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.medusa.ClusterConfig',
    'foam.nanos.medusa.ClusterConfigSupport',
    'foam.nanos.medusa.ClusterPingService',
    'foam.nanos.medusa.Status',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.NOT',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
      Logger logger = (Logger) getX().get("logger");
      if ( logger == null ) {
        logger = new StdoutLogger();
      }
      return new PrefixLogger(new Object[] {
        this.getClass().getSimpleName()
      }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'setup',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      // nop
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
    AppConfig app = (AppConfig) x.get("appConfig");

    if ( app.getMode() == foam.nanos.app.Mode.PRODUCTION ) {
      return;
    }

    ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
    ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
    ClusterPingService pingService = (ClusterPingService) x.get("mping");

    DAO dao = (DAO) x.get("localClusterConfigDAO");
    dao = dao.where(
      AND(
        EQ(ClusterConfig.ENABLED, true),
        EQ(ClusterConfig.STATUS, Status.ONLINE),
        NOT(EQ(ClusterConfig.ID, support.getConfigId())),
        EQ(ClusterConfig.REALM, myConfig.getRealm())
      ));
    List<ClusterConfig> configs = ((ArraySink) dao.select(new ArraySink())).getArray();
    int index = (int) (Math.random() * configs.size());
    ClusterConfig config = configs.get(index);
    try {
      pingService.ping(getX(), config.getId(), config.getPort(), 3000, config.getUseHttps());
    } catch ( java.io.IOException e ) {
      throw new RuntimeException(e);
    }
      `
    },
    {
      name: 'teardown',
      args: [
        {
          name: 'x',
          type: 'X'
        },
        {
          name: 'stats',
          type: 'Map'
        }
      ],
      javaCode: `
      // nop
      `
    }
  ]
});
