/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayBatchSink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Batch replies in some time window into a single (HTTP) send operation.',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.Map',
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private Object batchLock_ = new Object();
          private Object executeLock_ = new Object();

          public ReplayBatchSink(foam.core.X x, foam.dao.DAO dao, ReplayDetailsCmd details) {
            setX(x);
            setDao(dao);
            setDetails(details);
//            init_();
          }

        `);
      }
    }
  ],

  properties: [
    {
      name: 'details',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.ReplayDetailsCmd'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'batch',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'count',
      class: 'Long'
    },
    {
      name: 'maxBatchSize',
      class: 'Long',
      value: 1000
    },
    {
      name: 'batcherRunning',
      class: 'Boolean',
      value: false
    },
    {
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN'
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
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      synchronized ( batchLock_ ) {
        if ( getBatch().size() >= getMaxBatchSize() ) {
          send(getX());
        }
        ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
        MedusaEntry entry = (MedusaEntry) obj;
        entry.setNode(support.getConfigId());
        getLogger().debug("put", entry.getIndex(), getDetails().getRequester());
        getBatch().put(entry.getIndex(), entry);
      }
      `
    },
    {
      name: 'eof',
      javaCode: `
      getLogger().debug("eof");
      send(getX());
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
     // nop
     `
    },
    {
      name: 'send',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
    String pmName = getDetails().getResponder()+":"+getDetails().getRequester();
    try {
        Map batch;
        synchronized ( batchLock_ ) {
          batch = getBatch();
          ReplayBatchSink.BATCH.clear(this);
          setCount(getCount() + batch.size());
        }
        getLogger().debug("execute", "count", getCount(), "details", getDetails());

        if ( batch.size() > 0 ) {
          ReplayBatchCmd cmd = new ReplayBatchCmd();
          cmd.setDetails(getDetails());
          cmd.setBatch(batch);
          getLogger().debug("execute", "batch", batch.size());
          PM pm = createPM(x, pmName);
          getDao().cmd_(x, cmd);
          pm.log(x);
        }
        getLogger().debug("execute", "exit", "count", getCount(), "details", getDetails());
    } catch ( Throwable t ) {
      getLogger().error(t);
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
          type: 'String',
        }
      ],
      javaType: 'PM',
      javaCode: `
      return PM.create(x, this.getOwnClassInfo(), name);
      `
    },
  ]
});
