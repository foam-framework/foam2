/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastNARegionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntries to Non-Active Region Primary Mediator.`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],
  
  properties: [
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "medusaMediatorDAO";
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
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      entry = (MedusaEntry) getDelegate().put_(x, entry);

      if ( myConfig.getType() == MedusaType.NODE &&
           myConfig.getStatus() == Status.ONLINE &&
           myConfig.getRegionStatus() == RegionStatus.ACTIVE &&
           myConfig.getZone() == 0L ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);
      }
      return entry;
      `
    },
    {
      documentation: 'Using assembly line, write to mediators',
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
    try {
      // getLogger().debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      Agency agency = (Agency) x.get("threadPool");
      for ( ClusterConfig config : support.getBroadcastNARegionMediators() ) {
        // getLogger().debug("submit", "job", config.getId(), dop.getLabel(), "assembly");
        agency.submit(x, new ContextAgent() {
          public void execute(X x) {
            getLogger().debug("agency", "execute", config.getId());
             try {
              DAO dao = (DAO) getClients().get(config.getId());
              if ( dao == null ) {
                  dao = support.getBroadcastClientDAO(x, getServiceName(), myConfig, config);
                  dao = new RetryClientSinkDAO.Builder(x)
                          .setName(getServiceName())
                          .setDelegate(dao)
                          .setMaxRetryAttempts(0) // no retry
                          .build();
                getClients().put(config.getId(), dao);
              }

              if ( DOP.PUT == dop ) {
                dao.put_(x, (FObject) obj);
              } else if ( DOP.CMD == dop ) {
                dao.cmd_(x, obj);
              }
            } catch ( Throwable t ) {
              getLogger().error("agency", "execute", config.getId(), t);
            }
          }
        }, this.getClass().getSimpleName());
      }
      return obj;
    } catch (Throwable t) {
      getLogger().error(t.getMessage(), t);
      throw t;
    }
      `
    }
   ]
});
