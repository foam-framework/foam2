/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On status change to ONLINE initiate replay`,

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.OR',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
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
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfig nu = (ClusterConfig) obj;
      getLogger().debug("put", nu.getName());
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());

      nu = (ClusterConfig) getDelegate().put_(x, nu);

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           nu.getStatus() == Status.ONLINE ) {

        ClusterConfig config = nu;
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
        // If a Node comming online, begin replay from it.
        if ( support.getStandAlone() ||
            ( ( myConfig.getType() == MedusaType.MEDIATOR ||
               myConfig.getType() == MedusaType.NERF ) &&
               ( ( myConfig.getZone() == 0L &&
                   config.getType() == MedusaType.NODE &&
                   config.getZone() == 0L ) ||
                 ( config.getType() == MedusaType.MEDIATOR &&
                   config.getZone() == myConfig.getZone() - 1L ) ) &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) ) {

          // in standalone configuration, node is local
          DAO clientDAO = (DAO) x.get("medusaNodeDAO");
          if ( clientDAO == null ) {
            String serviceName = "medusaNodeDAO";
            if ( config.getType() == MedusaType.MEDIATOR ) {
              serviceName = "medusaEntryDAO";
            }
            clientDAO = support.getClientDAO(getX(), serviceName, myConfig, config);
            clientDAO = new RetryClientSinkDAO.Builder(getX())
              .setDelegate(clientDAO)
              .setMaxRetryAttempts(support.getMaxRetryAttempts())
              .setMaxRetryDelay(support.getMaxRetryDelay())
              .build();
          }
          // NOTE: using internalMedusaDAO else we'll block on ReplayingDAO.
          DAO dao = (DAO) x.get("internalMedusaDAO");
          dao = dao.where(EQ(MedusaEntry.PROMOTED, false));
          Min min = (Min) dao.select(MIN(MedusaEntry.INDEX));

          ReplayDetailsCmd details = new ReplayDetailsCmd();
          details.setRequester(myConfig.getId());
          details.setResponder(config.getId());
          if ( min != null &&
               min.getValue() != null ) {
            details.setMinIndex((Long) min.getValue());
          }
          getLogger().debug(myConfig.getId(), "ReplayDetailsCmd to", config.getId());
          details = (ReplayDetailsCmd) clientDAO.cmd_(getX(), details);
          getLogger().debug(myConfig.getId(), "ReplayDetailsCmd from", config.getId(), details);

          synchronized ( this ) {
            ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
            if ( replaying.getStartTime() == null ) {
              replaying.setStartTime(new java.util.Date());
            }
            DaggerService dagger = (DaggerService) x.get("daggerService");
            if ( details.getMaxIndex() > dagger.getGlobalIndex(getX())) {
              dagger.setGlobalIndex(getX(), details.getMaxIndex());
            }

            if ( details.getMaxIndex() > replaying.getReplayIndex() ) {
              replaying.setReplayIndex(details.getMaxIndex());
            }
            replaying.getReplayNodes().put(details.getResponder(), details);

            getLogger().debug(myConfig.getId(), "replaying", replaying.getReplaying(), "index", replaying.getIndex(), "replayIndex", replaying.getReplayIndex(), "node quorum", support.getHasNodeQuorum());

            if ( replaying.getIndex() >= replaying.getReplayIndex() &&
                 support.getHasNodeQuorum() ) {
              // special intial case - no data, or baseline
              ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
            }
          }

          if ( details.getMaxIndex() > 0 ) {
            ReplayCmd cmd = new ReplayCmd();
            cmd.setDetails(details);
            cmd.setServiceName("medusaMediatorDAO"); // TODO: configuration

            getLogger().debug(myConfig.getId(), "ReplayCmd to", config.getId());
            cmd = (ReplayCmd) clientDAO.cmd_(getX(), cmd);
            getLogger().debug(myConfig.getId(), "ReplayCmd from", config.getId(), cmd);
          }
        } else {
          getLogger().debug("no match");
        }
      } else {
        getLogger().debug("not online");
      }
      return nu;
      `
    }
  ]
});
