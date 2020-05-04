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

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.Map'
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
            init_();
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
      name: 'from',
      class: 'Long'
    },
    {
      name: 'to',
      class: 'Long'
    },
    {
      name: 'count',
      class: 'Long'
    },
    {
      name: 'batchTimerInterval',
      class: 'Long',
      value: 5
    },
    {
      name: 'maxBatchSize',
      class: 'Long',
      value: 1000
    },
    {
      name: 'complete',
      class: 'Boolean',
      value: false
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
      name: 'init_',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      setBatchTimerInterval(support.getBatchTimerInterval());
      setMaxBatchSize(support.getMaxBatchSize());
     ((Agency) getX().get(support.getThreadPoolName())).submit(getX(), this, this.getClass().getSimpleName());
     `
    },
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
        while ( getBatch().size() >= getMaxBatchSize() ) {
          try {
            getLogger().debug("put", "wait");
            batchLock_.wait(100);
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
        MedusaEntry entry = (MedusaEntry) obj;
        if ( getFrom() == 0L ) {
          setFrom(entry.getIndex());
        } else {
          setFrom(Math.min(getFrom(), entry.getIndex()));
        }
        setTo(Math.max(getTo(), entry.getIndex()));
        getBatch().put(entry.getIndex(), entry);
      }
      if ( getBatch().size() >= getMaxBatchSize() ) {
        synchronized ( executeLock_ ) {
          executeLock_.notify();
        }
      }
      `
    },
    {
      name: 'eof',
      javaCode: `
      setComplete(true);
      getLogger().debug("eof");
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
    String pmName = getDetails().getResponder()+":"+getDetails().getRequester();
    try {
      while ( ! getComplete() ||
              getCount() < getDetails().getCount() ||
              getBatch().size() > 0 ) {
        Map batch;
        synchronized ( batchLock_ ) {
          batch = getBatch();
          ReplayBatchSink.BATCH.clear(this);
          batchLock_.notifyAll();
        }
        setCount(getCount() + batch.size());
        long startTime = System.currentTimeMillis();

        getLogger().debug("execute", "batch", "size", batch.size(), "count", getCount(), "to", getTo(), "details", getDetails());

        if ( batch.size() > 0 ) {
          ReplayBatchCmd cmd = new ReplayBatchCmd();
          cmd.setDetails(getDetails());
          cmd.setFromIndex(getFrom());
          cmd.setToIndex(getTo());
          cmd.setBatch(batch);
          PM pm = createPM(x, pmName);
          getDao().cmd_(x, cmd);
          pm.log(x);
          // TODO - process results
        }

        long delay = getBatchTimerInterval() - (System.currentTimeMillis() - startTime);
        if ( delay > 0 ) {
          synchronized ( executeLock_ ) {
            getLogger().debug("execute", "wait", delay);
            executeLock_.wait(delay);
          }
        }
      }
      getLogger().debug("execute", "exit", "batch", "size", getBatch().size(), "count", getCount(), "to", getTo(), "details", getDetails());
    } catch (InterruptedException e) {
      // nop
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
