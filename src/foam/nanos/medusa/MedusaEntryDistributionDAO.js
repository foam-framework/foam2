/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryDistributionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Write MedusaEntry to the Medusa Nodes`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'Object',
      name: 'line',
      javaType: 'foam.util.concurrent.AssemblyLine',
      javaFactory: 'return new foam.util.concurrent.SyncAssemblyLine();'
    },
    {
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
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
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      getLogger().debug("put", entry);

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");

     // using assembly line, write to all online nodes - in all a zones.
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.TYPE, MedusaType.NODE)
          )
        )
        .orderBy(ClusterConfig.ZONE)
        .select(new ArraySink())).getArray();
      for ( ClusterConfig config : arr ) {
        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          public void executeJob() {
            try {
              DAO dao = (DAO) getClients().get(config.getId());
              if ( dao == null ) {
                DAO clientDAO = service.getClientDAO(x, "medusaEntryDAO", config, config);
                dao = new RetryClientSinkDAO.Builder(x)
                        .setDelegate(clientDAO)
                        .setMaxRetryAttempts(service.getMaxRetryAttempts())
                        .setMaxRetryDelay(service.getMaxRetryDelay())
                        .build();
                getClients().put(config.getId(), dao);
              }
              dao.put_(x, entry);
            } catch ( Throwable t ) {
              getLogger().error(t);
            }
          }
        });
      }
      return entry;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      String configId = null;
      if ( obj instanceof ReplayCmd ) {
        ReplayCmd cmd = (ReplayCmd) obj;
        configId = cmd.getResponder();
      } else if ( obj instanceof ReplayDetailsCmd ) {
        ReplayDetailsCmd cmd = (ReplayDetailsCmd) obj;
        configId = cmd.getResponder();
      }
      if ( configId != null ) {
        ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
        ClusterConfig config = service.getConfig(x, configId);
        DAO clientDAO = service.getClientDAO(x, "medusaEntryDAO", config, config);
        DAO dao = new RetryClientSinkDAO.Builder(x)
                         .setDelegate(clientDAO)
                         .setMaxRetryAttempts(service.getMaxRetryAttempts())
                         .setMaxRetryDelay(service.getMaxRetryDelay())
                         .build();
        getLogger().debug("cmd", obj);
        return dao.cmd_(x, obj);
      } else {
        return getDelegate().cmd_(x, obj);
      }
      `
    }
  ]
});
