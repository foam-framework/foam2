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
    'foam.dao.DAO',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.GTE',
    'foam.mlang.sink.Count',
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
      if ( ! ( obj instanceof ReplayCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }
      ReplayCmd cmd = (ReplayCmd) obj;
      getLogger().debug("cmd", cmd);

      // DEBUG
      Count count = (Count) getDelegate().where(
        GTE(MedusaEntry.INDEX, cmd.getFromIndex()))
      .orderBy(MedusaEntry.INDEX)
      .select(COUNT());
      getLogger().debug("cmd", "count", count.getValue());

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
      `
    }
  ]
});
