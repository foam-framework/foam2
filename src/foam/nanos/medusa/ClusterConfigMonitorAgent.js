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
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.COUNT',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'java.util.HashMap',
    'java.util.List',
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
      name: 'lastAlarmsSince',
      class: 'Date',
      javaFactory: 'return new java.util.Date(1081157732);'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
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
      schedule(getX());
      `
    },
    {
      name: 'schedule',
      args: [
        {
          name: 'x',
          type: 'X'
        },
      ],
      javaCode: `
      long interval = getTimerInterval();
      // getLogger().info("schedule", "interval", interval);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(x, support.getThreadPoolName(), this),
        interval);
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
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig config = support.getConfig(x, getId());
      try {
        if ( ! config.getEnabled() ) {
          // getLogger().debug("execute, disabled");
          return;
        }
        // getLogger().debug("execute");
        DAO client = support.getHTTPClientDAO(x, "clusterConfigDAO", myConfig, config);
        PM pm = new PM(this.getClass().getSimpleName(), config.getId());
        try {
          ClusterConfig cfg = (ClusterConfig) client.find_(x, config.getId());
          pm.log(x);
          if ( cfg != null ) {
            cfg.setPingTime(pm.getEndTime() - pm.getStartTime());
            getDao().put_(x, cfg);
          } else {
            getLogger().warning("client,find", config.getId(), "null");
          }
        } catch ( Throwable t ) {
          pm.error(x, t);
          if ( config.getStatus() != Status.OFFLINE ) {
            getLogger().debug(config.getId(), t.getClass().getSimpleName(), t.getMessage());
            ClusterConfig cfg = (ClusterConfig) config.fclone();
            cfg.setStatus(Status.OFFLINE);
            config = (ClusterConfig) getDao().put_(x, cfg);
          }
          Throwable cause = t.getCause();
          if ( cause == null ||
               ! ( cause instanceof java.io.IOException ) ) {
            getLogger().warning(config.getId(), t.getClass().getSimpleName(), t.getMessage(), t);
          }
        }

        java.util.Date now = new java.util.Date();
        client = support.getHTTPClientDAO(x, "alarmDAO", myConfig, config);
        client = client.where(
          AND(
            EQ(Alarm.SEVERITY, LogLevel.ERROR),
            EQ(Alarm.CLUSTERABLE, false),
            EQ(Alarm.HOSTNAME, config.getName()),
            GTE(Alarm.LAST_MODIFIED, getLastAlarmsSince())
          )
        );
        List<Alarm> alarms = (List) ((ArraySink) client.select(new ArraySink())).getArray();
        if ( alarms != null ) {
          DAO alarmDAO = (DAO) x.get("alarmDAO");
          for (Alarm alarm : alarms ) {
            getLogger().debug("alarm", alarm);
            alarmDAO.put(alarm);
          }
        }
        setLastAlarmsSince(now);
      } catch ( Throwable t ) {
        Throwable cause = t.getCause();
        if ( cause == null ||
             ! ( cause instanceof java.io.IOException ) &&
             config.getStatus() != Status.OFFLINE ) {
          getLogger().debug(config.getId(), t.getClass().getSimpleName(), t.getMessage(), t);
        }
      } finally {
        schedule(x);
      }
      `
    }
  ]
});
