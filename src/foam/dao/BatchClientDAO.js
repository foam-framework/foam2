/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'BatchClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Group all 'put' operations in some time window into a single cmd operation.
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
      name: 'puts',
      class: 'List',
      of: 'foam.core.FObject',
      javaFactory: 'return new ArrayList();'
    },
    {
      name: 'removes',
      class: 'List',
      of: 'foam.core.FObject',
      javaFactory: 'return new ArrayList();'
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
      documentation: 'Presently this is send and forget. Future - block and notify.',
      name: 'put_',
      javaCode: `
      synchronized ( batchLock_ ) {
        // clear context, so not marshalled.
        ((ContextAware) obj).setX(null);

        getPuts().add(obj);
        if ( getTimer() == null ) {
          scheduleTimer(getX(), getPuts().size());
        }
        // getLogger().debug("put", "batch", "size", getPuts().size());
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

        getRemoves().add(obj);
        if ( getTimer() == null ) {
          scheduleTimer(getX(), getRemoves().size());
        }
        // getLogger().debug("remove", "batch", "size", getRemoves().size());
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
      List<FObject> puts;
      List<FObject> removes;
      synchronized ( batchLock_ ) {
        puts = getPuts();
        removes = getRemoves();
        BatchClientDAO.PUTS.clear(this);
        BatchClientDAO.REMOVES.clear(this);
      }
      getLogger().debug("execute", "put batch", "size", puts.size());
      getLogger().debug("execute", "remove batch", "size", removes.size());

      try {
        if ( puts.size() > 0 ) {
          BatchCmd cmd = new BatchCmd();
          cmd.setDop(DOP.PUT);
          cmd.setBatch(puts);
          Object result = this.cmd_(x, cmd);
          // TODO/REVIEW - what to do with the result/reply?
        }
        if ( removes.size() > 0 ) {
          BatchCmd cmd = new BatchCmd();
          cmd.setDop(DOP.REMOVE);
          cmd.setBatch(removes);
          Object result = this.cmd_(x, cmd);
        }
      } finally {
        scheduleTimer(x, Math.max(puts.size(), removes.size()));
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
