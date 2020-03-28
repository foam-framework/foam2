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
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Max',
    'foam.nanos.http.PingService',
    'foam.nanos.logger.PrefixLogger',
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
      ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
      ClusterConfig myConfig = service.getConfig(getX(), service.getConfigId());
      ClusterConfig config = (ClusterConfig) ((ClusterConfig) obj).fclone();
      PingService ping = (PingService) getX().get("ping");

      Long startTime = System.currentTimeMillis();
      try {
        Long latency = ping.ping(getX(), config.getId(), config.getPort(), getTimeout());
        config.setPingLatency(latency);
        if ( config.getStatus() != Status.ONLINE) {
          config.setStatus(Status.ONLINE);
          getLogger().info(config.getId(), config.getType().getLabel(), config.getStatus().getLabel());

          // If a Node comming online, begin replay from it.
          if ( myConfig.getType() == MedusaType.MEDIATOR &&
               config.getType() == MedusaType.NODE &&
               config.getZone() == 0L &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) {
            DAO dao = (DAO) getX().get("localMedusaEntryDAO");
            dao = dao.where(EQ(MedusaEntry.HAS_CONSENSUS, true));
            Max max = (Max) dao.select(MAX(MedusaEntry.INDEX));
            Long index = 0L;
            if ( max != null &&
                 max.getValue() != null ) {
              index = (Long) max.getValue();
            }

            ReplayCmd cmd = new ReplayCmd();
            cmd.setRequester(myConfig.getId());
            cmd.setResponder(config.getId());
            cmd.setFromIndex(index);
            // TODO: configuration
            cmd.setServiceName("medusaEntryDAO");
            getLogger().info("Requesting replay", cmd);
            DAO nodesDAO = (DAO) getX().get("localMedusaEntryDAO");
            nodesDAO.cmd(cmd);
          }
        }
        ClusterConfig.PING_INFO.clear(config);
        if ( latency > config.getMaxPingLatency() ) {
          // TODO: Alarm
          getLogger().warning(config.getId(), config.getType().getLabel(), config.getStatus().getLabel(), "exceeded max ping latency", latency, " > ", config.getMaxPingLatency());
        }
      } catch (NullPointerException t) {
        getLogger().error(t);
      } catch (Throwable t) {
        if ( config.getStatus() != Status.OFFLINE ) {
          config.setPingInfo(t.getMessage());
          config.setStatus(Status.OFFLINE);
          getLogger().warning(config.getId(), config.getType().getLabel(), config.getStatus().getLabel(), t.getMessage());
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
