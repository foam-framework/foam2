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

      Long startTime = System.currentTimeMillis();
      try {
        Long latency = ping.ping(getX(), config.getId(), config.getPort(), getTimeout());
        config.setPingLatency(latency);
        if ( config.getStatus() != Status.ONLINE) {
          config.setStatus(Status.ONLINE);
          config = (ClusterConfig) getDao().put_(getX(), config);
          getLogger().info(config.getName(), config.getType().getLabel(), config.getStatus().getLabel());

          // If a Node comming online, begin replay from it.
          if ( myConfig.getType() == MedusaType.MEDIATOR &&
               config.getType() == MedusaType.NODE &&
               config.getZone() == 0L &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) {
            // NOTE: using internalMedusaEntryDAO else we'll block on ReplayingDAO.
            DAO dao = (DAO) getX().get("internalMedusaEntryDAO");
            dao = dao.where(EQ(MedusaEntry.HAS_CONSENSUS, true));
            Max max = (Max) dao.select(MAX(MedusaEntry.INDEX));

            ReplayCmd cmd = new ReplayCmd();
            cmd.setRequester(myConfig.getId());
            cmd.setResponder(config.getId());
            if ( max != null &&
                 max.getValue() != null ) {
              cmd.setFromIndex((Long) max.getValue());
            }
            // TODO: configuration
            cmd.setServiceName("medusaEntryDAO");

            DAO clientDAO = service.getClientDAO(getX(), "medusaEntryDAO", myConfig, config);
            clientDAO = new RetryClientSinkDAO.Builder(getX())
              .setDelegate(clientDAO)
              .setMaxRetryAttempts(service.getMaxRetryAttempts())
              .setMaxRetryDelay(service.getMaxRetryDelay())
              .build();

            getLogger().debug(myConfig.getId(), "Request replay from", config.getId());
            Object response = clientDAO.cmd_(getX(), cmd);

            if ( response instanceof ReplayDetailsCmd ) {
              getLogger().debug(myConfig.getId(), "Request replay response", response);
              ReplayDetailsCmd details = (ReplayDetailsCmd) response;
              ((DAO) getX().get("medusaEntryDAO")).cmd(details);
            } else {
              getLogger().debug(myConfig.getId(), "Invalid cmd response. Expected ReplayDetailsCmd. received", cmd.getClass().getSimpleName());
            }
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
          config.setPingInfo(t.getMessage());
          config.setStatus(Status.OFFLINE);
          config = (ClusterConfig) getDao().put_(getX(), config);
          getLogger().warning(config.getName(), config.getType().getLabel(), config.getStatus().getLabel(), t.getMessage());
        // TODO: Alarm.
        }
      }
      getDao().put_(getX(), config);
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
