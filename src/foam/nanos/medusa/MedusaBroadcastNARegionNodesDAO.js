/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastNARegionNodesDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `From Non-Active Primary Mediator Broadcast MedusaEntry to Non-Active Nodes. Each entry is distributed to set of nodes for redundancy and consensus.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "medusaNodeDAO";
      `
    },
    {
      // TODO: clear on ClusterConfig DAO updates
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
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getServiceName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
    {
      documentation: `
  - mod by node groups to get node bucket
  - create job for each client in bucket
`,
      name: 'put_',
      javaCode: `
      final MedusaEntry entry = (MedusaEntry) getDelegate().put_(x, obj);
      if ( ! entry.getPromoted() ) {
        return entry;
      }

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      if ( myConfig.getRegionStatus() == RegionStatus.STANDBY &&
           myConfig.getIsPrimary() ) {
 
        Agency agency = (Agency) x.get("threadPool");
  
        List<Set> buckets = support.getNodeBuckets();
        int index = (int) (entry.getIndex() % buckets.size());
        Set<String> bucket = buckets.get(index);
        for ( String id : bucket ) {
          ClusterConfig config = support.getConfig(x, id);
          agency.submit(x, new ContextAgent() {
            public void execute(X x) {
              try {
                DAO dao = (DAO) getClients().get(config.getId());
                if ( dao == null ) {
                  dao = support.getBroadcastClientDAO(x, getServiceName(), myConfig, config);
                  dao = new RetryClientSinkDAO.Builder(x)
                            .setDelegate(dao)
                            .setMaxRetryAttempts(support.getMaxRetryAttempts())
                            .setMaxRetryDelay(support.getMaxRetryDelay())
                            .build();
                  getClients().put(config.getId(), dao);
                }
  
                dao.put_(x, entry);
              } catch ( Throwable t ) {
                getLogger().error(t);
              }
            }
          }, this.getClass().getSimpleName());
        }
      }
      return obj;
      `
    }
  ]
});
