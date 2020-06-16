/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastDAO',
  extends: 'foam.nanos.medusa.BatchClientDAO',

  documentation: `Broadcast MedusaEntries.`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],
  
  properties: [
    {
      documentation: 'broadcast to this instance type',
      name: 'broadcastToType',
      class: 'Enum',
      of: 'foam.nanos.medusa.MedusaType',
      value: 'MEDIATOR'
    },
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      if ( getBroadcastToType() == MedusaType.NODE ) {
        return "medusaNodeDAO";
      }
      return "medusaMediatorDAO";
      `
    },
    {
      name: 'predicate',
      class: 'foam.mlang.predicate.PredicateProperty',
      factory: function() { return foam.mlang.MLang.FALSE; },
      javaFactory: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      if ( getBroadcastToType() == MedusaType.NODE ) {
        return
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          );
      }
      // MEDIATOR
      Predicate zones = EQ(ClusterConfig.ZONE, myConfig.getZone()+1);
      if ( myConfig.getZone() == 0L ) {
        zones =
          OR(
            EQ(ClusterConfig.ZONE, myConfig.getZone()),
            zones
          );
      }
      return
          AND(
            zones,
            EQ(ClusterConfig.TYPE, MedusaType.MEDIATOR),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          );
      `
    },
    {
      documentation: 'Determine if broadcasting or delegating. Always broadcast to/from Nodes.',
      name: 'broadcast',
      class: 'Boolean',
      value: 'false',
      javaFactory: `
      if ( getBroadcastToType() == MedusaType.NODE ) return true;

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      if ( myConfig.getType() == MedusaType.NODE ) return true;

      return false;
      `
    },
    {
      class: 'Object',
      name: 'assemblyLine',
      javaType: 'foam.util.concurrent.AssemblyLine',
      javaFactory: 'return new foam.util.concurrent.AsyncAssemblyLine(getX(), this.getClass().getSimpleName()+":"+getServiceName());'
    },
    {
      // TODO: clear on ClusterConfig DAO updates
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
          this.getClass().getSimpleName(),
          this.getServiceName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],
  
  methods: [
    {
      name: 'init_',
      javaCode: `
      // TODO 
      // listen on ClusterConfigDAO updates.
      `
    },
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      getLogger().debug("put", entry.getIndex());

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      MedusaEntry old = (MedusaEntry) getDelegate().find_(x, entry.getId());
      entry = (MedusaEntry) getDelegate().put_(x, entry);

      if ( support.getStandAlone() ) {
        return ((DAO) x.get(getServiceName())).put(entry);
      }

      // Always broadcast to/from NODE,
      // otherwise only broadcast verified (promoted) entries to other MEDIATORS
      if ( getBroadcast() ||
           getBroadcastToType() == MedusaType.MEDIATOR &&
           ( myConfig.getType() == MedusaType.MEDIATOR &&
               // REVIEW: to avoid broadcast during reply, wait until ONLINE,
               // mediators may miss data between replayComplete and status change to ONLINE.
             myConfig.getStatus() == Status.ONLINE &&
             ( entry.getVerified() &&
               ( old == null ||
                 ! old.getVerified() ) ) ) ) {

        // queue for broadcast
        return super.put_(x, entry);
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
      PM pm = createPM(x, dop.getLabel());
      try {
      getLogger().debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      List<ClusterConfig> arr = (ArrayList) ((ArraySink) ((DAO) x.get("localClusterConfigDAO"))
        .where(getPredicate())
        .select(new ArraySink())).getArray();

      for ( ClusterConfig config : arr ) {
        getAssemblyLine().enqueue(new foam.util.concurrent.AbstractAssembly() {
          public void executeJob() {
            try {
              DAO dao = (DAO) getClients().get(config.getId());
              if ( dao == null ) {
                dao = (DAO) x.get(getServiceName());
                if ( dao != null ) {
                  getLogger().debug("short circuit");
                } else {
                  dao = support.getClientDAO(x, getServiceName(), myConfig, config);
                  dao = new RetryClientSinkDAO.Builder(x)
                          .setDelegate(dao)
                          .setMaxRetryAttempts(support.getMaxRetryAttempts())
                          .setMaxRetryDelay(support.getMaxRetryDelay())
                          .build();
                }
              }
              getClients().put(config.getId(), dao);

              if ( DOP.PUT == dop ) {
                MedusaEntry entry = (MedusaEntry) obj;
                getLogger().debug("submit", "job", dop.getLabel(), entry.getIndex(), config.getName(), "data", (entry.getData() != null) ? entry.getData().getClass().getSimpleName():"null");
                dao.put_(x, entry);
              } else if ( DOP.CMD == dop ) {
                getLogger().debug("submit", "job", dop.getLabel(), obj.getClass().getSimpleName(), config.getName());
                dao.cmd_(x, obj);
              }
            } catch ( Throwable t ) {
              getLogger().error(t);
            }
          }
        });
      }
      return obj;
      } finally {
        pm.log(x);
      }
      `
    },
    {
      name: 'createPM',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ],
      javaType: 'PM',
      javaCode: `
      return PM.create(x, this.getOwnClassInfo(), getServiceName()+":"+name);
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
