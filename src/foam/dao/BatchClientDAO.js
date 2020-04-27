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
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.HashMap',
    'java.util.Map'
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
      name: 'defaultBatchTimerInterval',
      class: 'Long',
      value: 10
    },
    {
      name: 'defaultMaxBatchSize',
      class: 'Long',
      value: 10
    },
    {
      name: 'threadPoolName',
      class: 'String',
      value: 'threadPool'
    },
    {
      name: 'puts',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'removes',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'lastSend',
      class: 'Long',
      visibility: 'RO'
    },
    {
      name: 'agent',
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
      // clear context, so not marshalled.
      ((ContextAware) obj).setX(null);

      synchronized ( batchLock_ ) {
        while ( getPuts().size() >= getMaxBatchSize(x) ) {
          try {
            getLogger().debug("put", "wait");
            batchLock_.wait(100);
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
        getLogger().debug("put", "puts");
        getPuts().put(obj.getProperty("id"), obj);
        send(x);
      }
      return obj;
      `
    },
    {
      documentation: 'Presently this is send and forget. Future - block and notify.',
      name: 'remove_',
      javaCode: `
      // clear context, so not marshalled.
      ((ContextAware) obj).setX(null);

      synchronized ( batchLock_ ) {
        while ( getRemoves().size() >= getMaxBatchSize(x) ) {
          try {
            getLogger().debug("remove", "wait");
            batchLock_.wait(100);
          } catch (InterruptedException e) {
            throw new RuntimeException(e);
          }
        }
        getRemoves().put(obj.getProperty("id"), obj);
        send(x);
      }
      return obj;
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
      synchronized ( batchLock_ ) {
       getLogger().debug("send");
       if ( getAgent() != null ) {
          if ( getPuts().size() >= getMaxBatchSize(x) ||
               getRemoves().size() >= getMaxBatchSize(x) ||
               System.currentTimeMillis() - getLastSend() > getBatchTimerInterval(x) ) {
            getLogger().debug("send", "notify");
            batchLock_.notify();
          }
        } else {
          getLogger().debug("send", "agency");
          setAgent(this);
          ((Agency) x.get(getThreadPoolName())).submit(x, this, this.getClass().getSimpleName());
        }
      }
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
      try {
        while ( true ) {
          getLogger().debug("execute");
          Map puts;
          Map removes;
          long starttime = System.currentTimeMillis();

          synchronized ( batchLock_ ) {
            puts = getPuts();
            BatchClientDAO.PUTS.clear(this);
            removes = getRemoves();
            BatchClientDAO.REMOVES.clear(this);
            batchLock_.notify();
          }

          if ( puts.size() > 0 ) {
            getLogger().info("execute", "put batch", "size", puts.size());
            BatchCmd cmd = new BatchCmd();
            cmd.setDop(DOP.PUT);
            cmd.setBatch(puts);
            this.cmd_(x, cmd);
            // TODO - process results.
            setLastSend(System.currentTimeMillis());
          }
          if ( removes.size() > 0 ) {
            getLogger().info("execute", "remove batch", "size", removes.size());
            BatchCmd cmd = new BatchCmd();
            cmd.setDop(DOP.REMOVE);
            cmd.setBatch(removes);
            this.cmd_(x, cmd);
            setLastSend(System.currentTimeMillis());
            // TODO - process results.
          }

          synchronized ( batchLock_ ) {
            long count = Math.max(puts.size(), removes.size());
            if ( count > 0L ) {
              // sleep one interval before exiting on zero send.
              long delay = getBatchTimerInterval(x) - (System.currentTimeMillis() - starttime);
              if ( delay > 0 ) {
                getLogger().debug("execute", "wait", delay);
                batchLock_.wait(delay);
              }
            } else {
              getLogger().debug("execute", "exit", getPuts().size());
              BatchClientDAO.AGENT.clear(this);
              break;
            }
          }
        }
      } catch ( InterruptedException e ) {
        // nop
      } catch ( Throwable t ) {
        getLogger().error(t);
      } finally {
        BatchClientDAO.AGENT.clear(this);
      }
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
      javaCode: `return getDefaultBatchTimerInterval();`
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
      javaCode: `return getDefaultMaxBatchSize();`
    }
  ]
});
