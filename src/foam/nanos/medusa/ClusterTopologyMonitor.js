/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterTopologyMonitor',

  documentation: 'NOTE: do not start with cronjob.',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService',
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.NOT',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.Timer'
  ],

  axioms: [
    foam.pattern.Singleton.create(),
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  protected static Timer timer_ = null;
  protected static Boolean isRunning_ = false;
          `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialTimerDelay',
      class: 'Int',
      value: 10000
    },
    // {
    //   name: 'isRunning',
    //   class: 'Boolean',
    //   value: false,
    //   visibility: 'HIDDEN'
    // },
    // {
    //   name: 'timer',
    //   class: 'Object',
    //   visibility: 'HIDDEN'
    // },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      getLogger().info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      if ( timer_ != null ) {
        getLogger().warning("multiple instances", new Exception());
        return;
      }
      timer_ = new Timer(this.getClass().getSimpleName(), true);
      timer_.scheduleAtFixedRate(
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
      if ( ! getEnabled() ) {
        return;
      }
      synchronized ( timer_ ) {
        if ( isRunning_ ) {
          getLogger().debug("already running");
          return;
        }
        isRunning_ = true;
      }
      try {
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(x, support.getConfigId());
        // getLogger().debug("execute", config.getId(), config.getType().getLabel(), config.getStatus().getLabel());
        if ( support.getStandAlone() ) {
          // no need for ping timer in standalone mode.
          timer_.cancel();
          timer_.purge();
          return;
        }

        DAO dao = (DAO) x.get("localClusterConfigDAO");
        dao = dao.where(
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.REALM, config.getRealm())
          ));
        dao.select(new ClusterTopologySink(x, (DAO) x.get("localClusterTopologyDAO")));
      } finally {
        synchronized ( timer_ ) {
          isRunning_ = false;
        }
      }
        `
    }
  ]
});
