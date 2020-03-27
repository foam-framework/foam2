/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntrys back to Mediators.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
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
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      getLogger().debug("put", entry);

      // using assembly line, write to all online mediators in zone 0 and same realm,region
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      ClusterConfig myConfig = service.getConfig(x, service.getConfigId());
// TODO: move this to property and update on daoupdate. 
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.ZONE, 0),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
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
              getLogger().debug("put", config.getId());
              dao.put_(x, entry);
            } catch ( Throwable t ) {
              getLogger().error(t);
            }
          }
        });
      }
      return entry;
      `
    }
  ]
});
