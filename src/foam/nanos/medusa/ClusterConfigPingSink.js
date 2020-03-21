/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigPingSink',
  extends: 'foam.dao.AbstractSink',

  javaImports: [
    'foam.nanos.http.PingService',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected foam.dao.DAO dao_;

          public ClusterConfigPingSink(foam.core.X x, foam.dao.DAO dao, int timeout) {
            setX(x);
            dao_ = dao;
            setTimeout(timeout);
          }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'timeout',
      class: 'Int',
      value: 3000,
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      ClusterConfig config = (ClusterConfig) ((ClusterConfig) obj).fclone();
      Long startTime = System.currentTimeMillis();
      PingService ping = (PingService) getX().get("ping");
      try {
        Long latency = ping.ping(getX(), config.getId(), config.getServicePort(), getTimeout());
        config.setPingLatency(latency);
        if ( config.getStatus() != Status.ONLINE) {
          config.setStatus(Status.ONLINE);
          ((Logger) getX().get("logger")).info(this.getClass().getSimpleName(), config.getId(), config.getStatus().getLabel());
        }
        ClusterConfig.PING_INFO.clear(config);
        if ( latency > config.getMaxPingLatency() ) {
          // TODO: Alarm
          ((Logger) getX().get("logger")).warning(this.getClass().getSimpleName(), config.getId(), "exceeded max ping latency", latency, " > ", config.getMaxPingLatency());
        }
      } catch (Throwable t) {
        if ( config.getStatus() != Status.OFFLINE ) {
          config.setPingInfo(t.getMessage());
          config.setStatus(Status.OFFLINE);
          ((Logger) getX().get("logger")).warning(this.getClass().getSimpleName(), config.getId(), config.getStatus().getLabel(), t.getMessage());
        // TODO: Alarm.
        }
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
