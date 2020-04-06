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
      DaggerService dagger = (DaggerService) getX().get("daggerService");
      ClusterConfigService service = (ClusterConfigService) getX().get("clusterConfigService");
      ClusterConfig myConfig = service.getConfig(getX(), service.getConfigId());
      ClusterConfig config = (ClusterConfig) ((ClusterConfig) obj).fclone();
      PingService ping = (PingService) getX().get("ping");

      try {
        Long latency = ping.ping(getX(), config.getId(), config.getPort(), getTimeout());
        config.setPingLatency(latency);
        if ( config.getStatus() != Status.ONLINE) {
          getLogger().info(config.getName(), config.getType().getLabel(), config.getStatus().getLabel(), "->", "ONLINE");
          config.setStatus(Status.ONLINE);
          config = (ClusterConfig) getDao().put_(getX(), config);

          // If a Node comming online, begin replay from it.
          if ( myConfig.getType() == MedusaType.MEDIATOR &&
               config.getType() == MedusaType.NODE &&
               config.getZone() == 0L &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) {

            DAO clientDAO = service.getClientDAO(getX(), "medusaEntryDAO", myConfig, config);
            clientDAO = new RetryClientSinkDAO.Builder(getX())
              .setDelegate(clientDAO)
              .setMaxRetryAttempts(service.getMaxRetryAttempts())
              .setMaxRetryDelay(service.getMaxRetryDelay())
              .build();

            ReplayDetailsCmd details = new ReplayDetailsCmd();
            details.setRequester(myConfig.getId());
            details.setResponder(config.getId());
            getLogger().debug(myConfig.getId(), "ReplayDetailsCmd to", config.getId());
            details = (ReplayDetailsCmd) clientDAO.cmd_(getX(), details);
            getLogger().debug(myConfig.getId(), "ReplayDetailsCmd from", config.getId(), details);

            dagger.setGlobalIndex(getX(), details.getMaxIndex());

            // Send to Consensus DAO to prepare for Replay
            ((DAO) getX().get("medusaEntryDAO")).cmd(details);

            // NOTE: using internalMedusaEntryDAO else we'll block on ReplayingDAO.
            DAO dao = (DAO) getX().get("internalMedusaEntryDAO");
            dao = dao.where(EQ(MedusaEntry.HAS_CONSENSUS, true));
            Max max = (Max) dao.select(MAX(MedusaEntry.INDEX));

            ReplayCmd cmd = new ReplayCmd();
            cmd.setRequester(myConfig.getId());
            cmd.setResponder(config.getId());
            cmd.setServiceName("medusaEntryDAO"); // TODO: configuration
            if ( max != null &&
                 max.getValue() != null ) {
              cmd.setFromIndex((Long) max.getValue());
            }

            getLogger().debug(myConfig.getId(), "ReplayCmd to", config.getId());
            cmd = (ReplayCmd) clientDAO.cmd_(getX(), cmd);
            getLogger().debug(myConfig.getId(), "ReplayCmd from", config.getId(), cmd);
          }
        }
        ClusterConfig.PING_INFO.clear(config);
        if ( latency > config.getMaxPingLatency() ) {
          // TODO: Alarm
          getLogger().warning(config.getName(), config.getType().getLabel(), config.getStatus().getLabel(), "exceeded max ping latency", latency, " > ", config.getMaxPingLatency());
        }
      } catch (NullPointerException t) {
        getLogger().error(t);
      } catch (java.io.IOException t) {
        getLogger().debug("ping", config.getId(), t.getMessage());
        if ( config.getStatus() != Status.OFFLINE ) {
          getLogger().warning(config.getName(), config.getType().getLabel(), config.getStatus().getLabel(), "->", "OFFLINE",  t.getMessage());
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
