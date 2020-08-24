/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntries.`,

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
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected Object indexLock_ = new Object();
          `
        }));
      }
    }
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
      getLogger().debug("put", entry.getIndex());

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      if ( support.getStandAlone() ) {
        if ( getDelegate().find_(x, entry.getId()) == null ) {
          entry = (MedusaEntry) getDelegate().put_(x, entry);
          return ((DAO) x.get(getServiceName())).put_(x, entry);
        }
        return entry;
      }

      entry = (MedusaEntry) getDelegate().put_(x, entry);
      if ( entry.isFrozen() ) {
        return entry;
      }

      if ( myConfig.getType() == MedusaType.NODE ) {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        // NOTE: don't sync, just for reporting purposes. 
        // synchronized ( indexLock_ ) {
          if ( entry.getIndex() > replaying.getIndex() ) {
            replaying.setIndex(entry.getIndex());
          }
        // }

        submit(x, entry, DOP.PUT);
      } else if ( myConfig.getType() == MedusaType.MEDIATOR &&
        // Broadcast promoted entries to other MEDIATORS
        // REVIEW: to avoid broadcast during reply, wait until ONLINE,
        // mediators may miss data between replayComplete and status change to ONLINE.
                  myConfig.getStatus() == Status.ONLINE &&
                  entry.getPromoted() ) {
                  // REVIEW: can't test for old, freezing is off so old always equals new.
                  // ( entry.getPromoted() &&
                  //   ( old == null ||
                  //     ! old.getPromoted() ) ) ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);

        // REVIEW: broadcasted, can now copy and delete data put to save space
        // entry = (MedusaEntry) entry.shallowClone();
        // entry.setData(null);
        // entry.__frozen__ = true;
        entry = (MedusaEntry) getDelegate().put_(x, entry);
      }
      return entry;
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
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      Agency agency = (Agency) x.get("threadPool");
      for ( ClusterConfig config : support.getBroadcastMediators() ) {
        getLogger().debug("submit", "job", config.getId(), dop.getLabel(), "assembly");
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
                          .setMaxRetryAttempts(support.getMaxRetryAttempts())
                          .setMaxRetryDelay(support.getMaxRetryDelay())
                          .build();
                getClients().put(config.getId(), dao);
              }

              if ( DOP.PUT == dop ) {
                MedusaEntry entry = (MedusaEntry) obj;
                entry.setNode(support.getConfigId());
                getLogger().debug("agency", "execute", config.getId(), dop.getLabel(), entry.getIndex());
                dao.put_(x, entry);
              } else if ( DOP.CMD == dop ) {
                getLogger().debug("agency", "execute", config.getId(), dop.getLabel(), obj.getClass().getSimpleName());
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
