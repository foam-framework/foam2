/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Response to ReplayCmd`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
  ],

  properties: [
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
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ReplayDetailsCmd ) {
        ReplayDetailsCmd details = (ReplayDetailsCmd) obj;
        getLogger().debug("cmd", details);

        Min min = (Min) MIN(MedusaEntry.INDEX);
        Max max = (Max) MAX(MedusaEntry.INDEX);
        Count count = new Count();
        Sequence seq = new Sequence.Builder(x)
          .setArgs(new Sink[] {count, min, max})
          .build();

        getDelegate().select(seq);
        getLogger().debug("cmd", "details", "count", count.getValue(), "min", min.getValue(), "max", max.getValue());

        if ( count != null &&
             ((Long) count.getValue()) > 0 ) {
          details.setMinIndex((Long)min.getValue());
          details.setMaxIndex((Long)max.getValue());
          details.setCount((Long) count.getValue());
        }
        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        getLogger().debug("cmd", cmd);

        ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
        ClusterConfig fromConfig = service.getConfig(x, cmd.getResponder());
        ClusterConfig toConfig = service.getConfig(x, cmd.getRequester());
        DAO clientDAO = service.getClientDAO(x, cmd.getServiceName(), fromConfig, toConfig);
        getDelegate().where(
          GTE(MedusaEntry.INDEX, cmd.getFromIndex())
        )
        .orderBy(MedusaEntry.INDEX)
        .select(new RetryClientSinkDAO.Builder(x)
          .setDelegate(clientDAO)
          .setMaxRetryAttempts(service.getMaxRetryAttempts())
          .setMaxRetryDelay(service.getMaxRetryDelay())
          .build());

        return cmd;
      }

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
