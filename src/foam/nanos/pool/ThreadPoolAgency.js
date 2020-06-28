/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pool',
  name: 'ThreadPoolAgency',
  extends: 'foam.nanos.pool.AbstractFixedThreadPool',

  implements: [
    'foam.core.Agency',
    'foam.nanos.NanoService'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.concurrent.LinkedBlockingQueue',
    'java.util.concurrent.ExecutorService',
    'java.util.concurrent.Executors',
    'java.util.concurrent.RejectedExecutionException',
    'java.util.concurrent.ThreadFactory',
    'java.util.concurrent.ThreadPoolExecutor',
    'java.util.concurrent.TimeUnit',
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected ThreadPoolExecutor pool_          = null;
  protected Object             queuedLock_    = new Object();
  protected Object             executingLock_ = new Object();
  protected Object             executedLock_  = new Object();

  protected class ContextAgentRunnable
    implements Runnable {

    protected X x_;
    protected ContextAgent agent_;
    protected String description_;

    public ContextAgentRunnable(X x, ContextAgent agent, String description) {
      x_ = x;
      agent_ = agent;
      description_ = description;
    }

    public void run() {
      incrExecuting(1);
      incrQueued(-1);

      Logger logger = (Logger) x_.get("logger");
      PM     pm     = new PM(this.getClass(), agent_.getClass().getSimpleName()+":"+description_);

      try {
        agent_.execute(x_);
      } catch (Throwable t) {
        logger.error(this.getClass(), agent_.getClass().getSimpleName(), description_, t.getMessage(), t);
      } finally {
        incrExecuting(-1);
        incrExecuted();
        pm.log(x_);
      }
    }
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
    pool_ = new ThreadPoolExecutor(
      getNumberOfThreads(),
      getNumberOfThreads(),
      10,
      TimeUnit.SECONDS,
      new LinkedBlockingQueue<Runnable>(),
      new ThreadFactory() {
        final AtomicInteger threadNumber = new AtomicInteger(1);

        public Thread newThread(Runnable runnable) {
          Thread thread = new Thread(
                                     Thread.currentThread().getThreadGroup(),
                                     runnable,
                                     getPrefix() + "-" + threadNumber.getAndIncrement(),
                                     0
                                     );
          // Thread don not block server from shut down.
          thread.setDaemon(true);
          thread.setPriority(Thread.NORM_PRIORITY);
          return thread;
        }
      }
    );
    pool_.allowCoreThreadTimeOut(true);
`
    },
    {
      name: 'incrExecuting',
      args: [
        {
          name: 'd',
          type: 'int'
        }
      ],
      javaCode: `
    synchronized ( executingLock_ ) {
      setExecuting(getExecuting() + d);
    }
      `
    },
    {
      name: 'incrExecuted',
      javaCode: `
    synchronized ( executingLock_ ) {
      setExecuted(getExecuted() + 1);
    }
      `
    },
    {
      name: 'incrQueued',
      args: [
        {
          name: 'd',
          type: 'int'
        }
      ],
      javaCode: `
    synchronized ( queuedLock_ ) {
      setQueued(getQueued() + d);
    }
      `
    },
    {
      name: 'getPool',
      type: 'ExecutorService',
      javaCode: `
    return pool_;
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'agent',
          type: 'foam.core.ContextAgent'
        },
        {
          name: 'description',
          type: 'String'
        }
      ],
      javaCode: `
    incrQueued(1);
    getPool().submit(new ContextAgentRunnable(x, agent, description));
     `
    }
  ]
});
