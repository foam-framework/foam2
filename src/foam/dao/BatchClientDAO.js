/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'BatchClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documenation: `Group all 'put' operations in some time window into a single cmd operation.
Presently this is send and forget.
NOTE: override cmd_ in child class to control delegate call`,

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAware',
    'foam.core.FObject',
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
        `);
      }
    }
  ],

  properties: [
    {
      name: 'batchTimerInterval',
      class: 'Long',
      value: 16
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'threadPool'
    },
    {
      name: 'batch',
      class: 'List',
      of: 'foam.nanos.medusa.MedusaEntry',
      javaFactory: 'return new ArrayList();'
    },
    {
      name: 'removeBatch',
      class: 'List',
      of: 'foam.nanos.medusa.MedusaEntry',
      javaFactory: 'return new ArrayList();'
    },
    {
      name: 'timer',
      class: 'Object',
      visibilty: 'HIDDEN'
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
      documentation: 'Presently this is send and forget. Future - block and notify.',
      name: 'put_',
      javaCode: `
      synchronized ( batchLock_ ) {
        // clear context, so not marshalled.
        ((ContextAware) obj).setX(null);

        getBatch().add(obj);
        if ( getTimer() == null ) {
          scheduleTimer(getX(), getBatch().size());
        }
        // getLogger().debug("put", "batch", "size", getBatch().size());
      }
      return obj;
      `
    },
    {
      documentation: 'Presently this is send and forget. Future - block and notify.',
      name: 'remove_',
      javaCode: `
      synchronized ( batchLock_ ) {
        // clear context, so not marshalled.
        ((ContextAware) obj).setX(null);

        getRemoveBatch().add(obj);
        if ( getTimer() == null ) {
          scheduleTimer(getX(), getRemoveBatch().size());
        }
        // getLogger().debug("put", "removeBatch", "size", getRemoveBatch().size());
      }
      return obj;
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
      List<FObject> batch;
      synchronized ( batchLock_ ) {
        batch = getBatch();
        BatchClientDAO.BATCH.clear(this);
      }
      getLogger().debug("execute", "batch", "size", batch.size());

      try {
        if ( batch.size() > 0 ) {
          BatchCmd cmd = new BatchCmd();
          cmd.setBatch(batch);
          Object result = this.cmd_(x, cmd);
          // TODO/REVIEW - what to do with the result/reply?
        }
      } finally {
        scheduleTimer(x, batch.size());
      }
      `
    },
    {
      name: 'scheduleTimer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'count',
          type: 'Long'
        }
      ],
      javaCode: `
      synchronized ( batchLock_ ) {
        if ( count > 0 ) {
          if ( getTimer() == null ) {
            Timer timer = new Timer(this.getClass().getSimpleName(), true);
            timer.scheduleAtFixedRate(
              new AgencyTimerTask(x, getThreadPoolName(), this),
              getBatchTimerInterval(),
              getBatchTimerInterval()
            );
            setTimer(timer);
            getLogger().debug("timer", "scheduled");
          }
        } else if ( getTimer() != null ) {
          Timer timer = (Timer) getTimer();
          timer.cancel();
          timer.purge();
          BatchClientDAO.TIMER.clear(this);
          getLogger().debug("timer", "cancel");
        }
      }
      `
    },
  ]
});
