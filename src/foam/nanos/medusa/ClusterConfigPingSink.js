/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigPingSink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Attempt to contact Nodes and Mediators, record ping time and mark them ONLINE or OFFLINE.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.http.PingService',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ClusterConfigPingSink(foam.core.X x, foam.dao.DAO dao, int timeout) {
            setX(x);
            setDao(dao);
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
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
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
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      ClusterConfig config = (ClusterConfig) obj;
      PingService ping = (PingService) getX().get("mping");
      try {
        Long latency = ping.ping(getX(), config.getId(), config.getPort(), getTimeout(), config.getUseHttps());
        config = (ClusterConfig) support.getConfig(getX(), config.getId()).fclone();
        config.setPingLatency(latency);
        if ( config.getStatus() != Status.ONLINE) {
          config.setStatus(Status.ONLINE);
          config.setPingInfo("");
          config = (ClusterConfig) getDao().put_(getX(), config).fclone();
        }
        ClusterConfig.PING_INFO.clear(config);
        if ( latency > config.getMaxPingLatency() ) {
          // TODO: Alarm
          getLogger().warning(config.getName(), config.getType().getLabel(), config.getStatus().getLabel(), "exceeded max ping latency", latency, " > ", config.getMaxPingLatency());
        }
      } catch (NullPointerException t) {
        getLogger().error(t);
      } catch (RuntimeException | java.io.IOException t) {
        getLogger().debug("ping", config.getId(), t.getMessage());
        if ( config.getStatus() != Status.OFFLINE ) {
          config = (ClusterConfig) config.fclone();
          config.setPingInfo(t.getMessage());
          config.setStatus(Status.OFFLINE);
          config = (ClusterConfig) getDao().put_(getX(), config);
        // TODO: Alarm.
        }
      }
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
