/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigNARegionReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Non-Active Region Mediator request replay from Active Region Nodes.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.OR',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.List'
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
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      if ( ! (
           myConfig.getType() == MedusaType.MEDIATOR &&
           myConfig.getRegionStatus() == RegionStatus.STANDBY &&
           myConfig.getStatus() == Status.ONLINE &&
           myConfig.getRealm() == nu.getRealm()
         ) ) {
        return nu;
      }

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           nu.getStatus() == Status.ONLINE ) {

        getLogger().info(nu.getName(), old.getStatus().getLabel(), "->", nu.getStatus().getLabel().toUpperCase());

        if ( nu.getType() == MedusaType.NODE &&
             nu.getRegionStatus() == RegionStatus.ACTIVE &&
             nu.getZone() == 0L ) {
          // NODE ONLINE - replay
          replay(x, myConfig, nu);
        } else if ( nu.getType() == MedusaType.MEDIATOR &&
                    nu.getId().equals(myConfig.getId()) ) {
          // Self ONLINE - replay from all Nodes
          List<ClusterConfig> configs = ((ArraySink) ((DAO) x.get("clusterConfigDAO"))
            .where(
                AND(
                    EQ(ClusterConfig.TYPE, MedusaType.NODE),
                    EQ(ClusterConfig.ZONE, 0L),
                    EQ(ClusterConfig.ENABLED, true),
                    EQ(ClusterConfig.STATUS, Status.ONLINE),
                    EQ(ClusterConfig.REALM, myConfig.getRealm()),
                    EQ(ClusterConfig.REGION_STATUS, RegionStatus.ACTIVE)
                )
            )
            .select(new ArraySink())).getArray();
          for ( ClusterConfig config : configs ) {
            replay(x, myConfig, config);
          }
        }
      }
      return nu;
      `
    },
    {
      name: 'replay',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'myConfig',
          type: 'foam.nanos.medusa.ClusterConfig'
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ],
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      String serviceName = "medusaNodeDAO";
      DAO clientDAO = support.getClientDAO(x, serviceName, myConfig, config);
      clientDAO = new RetryClientSinkDAO.Builder(x)
        .setName(serviceName)
        .setDelegate(clientDAO)
        .setMaxRetryAttempts(0)
        // .setMaxRetryAttempts(support.getMaxRetryAttempts())
        // .setMaxRetryDelay(support.getMaxRetryDelay())
        .build();

      // NOTE: using internalMedusaDAO else we'll block on ReplayingDAO.
      DAO dao = (DAO) x.get("internalMedusaDAO");
      dao = dao.where(EQ(MedusaEntry.PROMOTED, false));
      Min min = (Min) dao.select(MIN(MedusaEntry.INDEX));
      Long minIndex = 0L;
      ReplayDetailsCmd details = new ReplayDetailsCmd();
      details.setRequester(myConfig.getId());
      details.setResponder(config.getId());
      if ( min != null &&
           min.getValue() != null ) {
        details.setMinIndex((Long) min.getValue());
        minIndex = details.getMinIndex();
      }
      getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "request");
      details = (ReplayDetailsCmd) clientDAO.cmd_(x, details);
      getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "response", details);

      if ( details.getMaxIndex() > minIndex ) {
        ReplayCmd cmd = new ReplayCmd();
        cmd.setDetails(details);
        cmd.setServiceName("medusaMediatorDAO"); // TODO: configuration

        getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "request", cmd.getDetails());
        cmd = (ReplayCmd) clientDAO.cmd_(x, cmd);
        getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "response");
      }
      `
    }
  ]
});
