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
    'foam.core.AgencyTimerTask',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Timer'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          private Object batchLock_ = new Object();

          public ReplayBatchSink(foam.core.X x, foam.dao.DAO dao, ReplayDetailsCmd details) {
            setX(x);
            setDao(dao);
            setDetails(details);
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
      name: 'count',
      class: 'Long'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'batch',
      class: 'List',
      of: 'foam.nanos.medusa.MedusaEntry',
      javaFactory: 'return new ArrayList();'
    },
    {
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN'
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
        getBatch().add(obj);
        if ( getTimer() == null ) {
          scheduleTimer(getX());
        }
        //getLogger().debug("put", "batch", "size", getBatch().size());
      }
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
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
      List<MedusaEntry> batch;
      synchronized ( batchLock_ ) {
        batch = getBatch();
        ReplayBatchSink.BATCH.clear(this);
      }
      getLogger().debug("execute", "batch", "size", batch.size());

      try {
        if ( batch.size() == 0 ) {
          return;
        }
        ReplayBatchCmd cmd = new ReplayBatchCmd();
        cmd.setDetails(getDetails());
        cmd.setFromIndex(batch.get(0).getIndex());
        cmd.setToIndex(batch.get(batch.size()-1).getIndex());
        cmd.setBatch(batch);
        getDao().cmd_(x, cmd);
      } finally {
        setCount(getCount() + batch.size());
        scheduleTimer(x);
      }
      `
    },
    {
      name: 'scheduleTimer',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      if ( ! getComplete() &&
           getCount() < getDetails().getCount() ) {
        if ( getTimer() == null ) {
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          Timer timer = new Timer(this.getClass().getSimpleName(), true);
          timer.scheduleAtFixedRate(
            new AgencyTimerTask(x, support.getThreadPoolName(), this),
            support.getReplayBatchTimerInterval(),
            support.getReplayBatchTimerInterval()
          );
          setTimer(timer);
          getLogger().debug("timer", "scheduled");
        }
      } else if ( getTimer() != null ) {
        Timer timer = (Timer) getTimer();
        timer.cancel();
        timer.purge();
        getLogger().debug("timer", "cancel");
      }
      `
    },
  ]
});
