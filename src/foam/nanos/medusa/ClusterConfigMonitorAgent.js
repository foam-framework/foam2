/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigMonitorAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  documentation: 'Attempt to contact Nodes and Mediators, record ping time and mark them ONLINE or OFFLINE.',

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.Timer'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public ClusterConfigMonitorAgent(foam.core.X x, String id, foam.dao.DAO dao) {
    setX(x);
    setId(id);
    setDao(dao);
  }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'timerInterval',
      class: 'Long',
      // TODO: make random ,
      value: 10000,
      javaFactory: ` // 7000-10000 ms
      return ((long)(Math.random() * 3))*1000 + 7000;
      `
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 5000
    },
    {
      name: 'timer',
      class: 'Object'
    },
    {
      name: 'isRunning',
      class: 'Boolean'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          this.getId()
        }, (Logger) getX().get("logger"));
      `
    }
 ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      getLogger().info("start", "interval", getTimerInterval());
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.scheduleAtFixedRate(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(),
        getTimerInterval());
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
      synchronized ( getTimer() ) {
       if ( getIsRunning() ) {
          getLogger().debug("execute,already running");
          return;
        }
        setIsRunning(true);
      }

      try {
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
          ClusterConfig config = support.getConfig(x, getId());
          if ( ! config.getEnabled() ) {
            getLogger().debug("execute, disabled");
            return;
          }
          DAO client = support.getHTTPClientDAO(x, "clusterConfigDAO", myConfig, config);
          PM pm = new PM(this.getClass().getSimpleName(), config.getId());
          try {
            ClusterConfig cfg = (ClusterConfig) client.find_(x, config.getId());
            pm.log(x);
            if ( cfg != null ) {
              cfg.setPingTime(pm.getEndTime() - pm.getStartTime());
              getDao().put_(x, cfg);
            } else {
              getLogger().warning("client,find", cfg.getId(), "null");
            }
          } catch ( Throwable t ) {
            pm.error(x, t);
            getLogger().debug(config.getId(), t.getClass().getSimpleName(), t.getMessage());
            if ( config.getStatus() != Status.OFFLINE ) {
              ClusterConfig cfg = (ClusterConfig) config.fclone();
              cfg.setStatus(Status.OFFLINE);
              getDao().put_(x, cfg);
            }
          }
      } finally {
        synchronized ( getTimer() ) {
          setIsRunning(false);
        }
      }
      `
    }
  ]
});
