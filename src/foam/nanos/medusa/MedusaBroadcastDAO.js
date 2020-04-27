/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastDAO',
  extends: 'foam.dao.BatchClientDAO',
//  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntrys back to Mediators.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
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
      javaFactory: 'return new foam.util.concurrent.AsyncAssemblyLine(getX());'
    },
    {
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'medusaThreadPool'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
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
      documentation: 'Using assembly line, write to all online mediators in zone 0 and same realm,region',
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", entry.getIndex());
      return super.put_(x, getDelegate().put_(x, obj));
      `
    },
    {
      documentation: 'Using assembly line, write to all online mediators in zone 0 and same realm,region',
      name: 'cmd_',
      javaCode: `
      return submit(x, obj, DOP.CMD);
      `
    },
    {
      documentation: 'Using assembly line, write to all online mediators in zone 0 and same realm,region',
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
      ],
      type: 'Object',
      javaCode: `
      getLogger().debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
// TODO: move this to property and update on daoupdate. 
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            OR(
              EQ(ClusterConfig.ZONE, myConfig.getZone()),
              EQ(ClusterConfig.ZONE, myConfig.getZone()+1)
            ),
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          )
        )
        .select(new ArraySink())).getArray();

      for ( ClusterConfig config : arr ) {
        getLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          public void executeJob() {
            try {
              // TODO: clear map onDAOUpdate, this doesn't cache miss.
//              DAO dao = (DAO) getClients().get(config.getId());
//              if ( dao == null ) {
                DAO clientDAO = support.getClientDAO(x, "medusaConsensusDAO", myConfig, config);
                DAO dao = new RetryClientSinkDAO.Builder(x)
                        .setDelegate(clientDAO)
                        .setMaxRetryAttempts(support.getMaxRetryAttempts())
                        .setMaxRetryDelay(support.getMaxRetryDelay())
                        .build();
//                getClients().put(config.getId(), dao);
//              }
              if ( DOP.PUT == dop ) {
                MedusaEntry entry = (MedusaEntry) obj;
                getLogger().debug("submit", dop.getLabel(), entry.getIndex(), config.getName(), "data", (entry.getData() != null) ? entry.getData().getClass().getSimpleName():"null");
                dao.put_(x, entry);
              } else if ( DOP.CMD == dop ) {
                getLogger().debug("submit", dop.getLabel(), obj.getClass().getSimpleName(), config.getName());
                dao.cmd_(x, obj);
              }
            } catch ( Throwable t ) {
              getLogger().error(t);
            }
          }
        });
      }
      return obj;
      `
    },
    {
      name: 'getBatchTimerInterval',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Long',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      return support.getBatchTimerInterval();
      `
    },
    {
      name: 'getMaxBatchSize',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Long',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      return support.getMaxBatchSize();
      `
    }
   ]
});
