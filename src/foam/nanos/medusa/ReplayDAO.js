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
    'static foam.mlang.MLang.GT',
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
        getLogger().debug("cmd", "request", details);

        Min min = (Min) MIN(MedusaEntry.INDEX);
        Max max = (Max) MAX(MedusaEntry.INDEX);
        Count count = new Count();
        Sequence seq = new Sequence.Builder(x)
          .setArgs(new Sink[] {count, min, max})
          .build();

        getDelegate()
          .where(GT(MedusaEntry.INDEX, details.getMinIndex()))
          .select(seq);

        if ( count != null &&
             ((Long) count.getValue()) > 0 ) {
          details.setMinIndex((Long)min.getValue());
          details.setMaxIndex((Long)max.getValue());
          details.setCount((Long) count.getValue());
        }
        getLogger().debug("cmd", "response", details);
        return details;
      }

      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        getLogger().debug("cmd", cmd);

        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig fromConfig = support.getConfig(x, cmd.getDetails().getResponder());
        ClusterConfig toConfig = support.getConfig(x, cmd.getDetails().getRequester());
        DAO clientDAO = support.getClientDAO(x, cmd.getServiceName(), fromConfig, toConfig);
        // NOTE: toIndex not yet used.
        getDelegate().where(
          GTE(MedusaEntry.INDEX, cmd.getDetails().getMinIndex())
        )
        .orderBy(MedusaEntry.INDEX)
        .select(new ReplayBatchSink(x, clientDAO, cmd.getDetails()));
        return cmd;
      }

      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
