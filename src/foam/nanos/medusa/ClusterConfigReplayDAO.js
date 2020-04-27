/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On Node status change to ONLINE initiate replay`,

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Max',
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
    },
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
        if ( myConfig.getType() == MedusaType.MEDIATOR &&
               config.getType() == MedusaType.NODE &&
               config.getZone() == 0L &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) {

            DAO clientDAO = support.getClientDAO(getX(), "medusaNodeDAO", myConfig, config);
            clientDAO = new RetryClientSinkDAO.Builder(getX())
              .setDelegate(clientDAO)
              .setMaxRetryAttempts(support.getMaxRetryAttempts())
              .setMaxRetryDelay(support.getMaxRetryDelay())
              .build();

            // NOTE: using internalMedusaEntryDAO else we'll block on ReplayingDAO.
            DAO dao = (DAO) getX().get("internalMedusaEntryDAO");
            dao = dao.where(EQ(MedusaEntry.HAS_CONSENSUS, true));
            Max max = (Max) dao.select(MAX(MedusaEntry.INDEX));

            ReplayDetailsCmd details = new ReplayDetailsCmd();
            details.setRequester(myConfig.getId());
            details.setResponder(config.getId());
            if ( max != null &&
                 max.getValue() != null ) {
              //cmd.setFromIndex((Long) max.getValue());
              details.setMinIndex((Long) max.getValue());
            }
            getLogger().debug(myConfig.getId(), "ReplayDetailsCmd to", config.getId());
            details = (ReplayDetailsCmd) clientDAO.cmd_(getX(), details);
            getLogger().debug(myConfig.getId(), "ReplayDetailsCmd from", config.getId(), details);

            DaggerService dagger = (DaggerService) x.get("daggerService");
            dagger.setGlobalIndex(getX(), details.getMaxIndex());

            // Send to Consensus DAO to prepare for Replay
            ((DAO) getX().get("medusaConsensusDAO")).cmd(details);

            ReplayCmd cmd = new ReplayCmd();
            cmd.setDetails(details);
            cmd.setServiceName("medusaConsensusDAO"); // TODO: configuration

            getLogger().debug(myConfig.getId(), "ReplayCmd to", config.getId());
            cmd = (ReplayCmd) clientDAO.cmd_(getX(), cmd);
            getLogger().debug(myConfig.getId(), "ReplayCmd from", config.getId(), cmd);
          }
      }
      return nu;
      `
    }
  ]
});
