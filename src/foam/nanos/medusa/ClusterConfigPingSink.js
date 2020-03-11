/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigPingSink',
  extends: 'foam.dao.ProxySink',

  javaImports: [
    'foam.nanos.http.PingService',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected foam.dao.DAO dao_;

          public ClusterConfigPingSink(foam.core.X x, foam.dao.DAO dao) {
            setX(x);
            dao_ = dao;
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'foam.core.FObject'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      ClusterConfig old = (ClusterConfig) obj;
      ((Logger) getX().get("logger")).debug(this.getClass().getSimpleName(), old.getId(), old.getStatus().getLabel());
      ClusterConfig config = (ClusterConfig) obj.fclone();
      Long startTime = System.currentTimeMillis();
      PingService ping = (PingService) getX().get("ping");
      try {
        Long latency = ping.ping(getX(), config.getId(), config.getServicePort());
        config.setPingLatency(latency);
        config.setStatus(Status.ONLINE);
        ClusterConfig.PING_INFO.clear(config);
        // if ( old.getStatus() == Status.OFFLINE ) {
        //   ClusterConfigService clusterService = (ClusterConfigService) getX().get("clusterConfigService");
        //   if ( clusterService.canVote(getX(), config) ) {
        //     ElectoralService electoralService = (ElectoralService) getX().get("electoralService");
        //     electoralService.dissolve();
        //   }
        // }
        if ( latency > config.getMaxPingLatency() ) {
          // TODO: Alarm
        }
      } catch (Throwable t) {
        ((Logger) getX().get("logger")).warning(t);
        config.setPingInfo(t.getMessage());
        config.setStatus(Status.OFFLINE);
        // Alarm.
      }
      dao_.put_(getX(), config);
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
