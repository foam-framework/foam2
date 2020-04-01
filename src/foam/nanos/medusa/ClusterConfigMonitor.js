/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigMonitor',

  documentation: 'NOTE: do not start with cronjob. This process starts the ClusterConfigPinkSing which polls the Mediators and Nodes and will initiate Replay, and Elections.',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.NEQ',
    'static foam.mlang.MLang.NOT',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'interval',
      class: 'Long',
      value: 3000
    },
    {
      name: 'timeout',
      class: 'Int',
      value: 3000
    }
  ],

  methods: [
    {
      documentation: 'Start as a NanoService',
      name: 'start',
      javaCode: `
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.scheduleAtFixedRate(
        new AgencyTimerTask(getX(), this),
        getInterval(),
        getInterval());
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
      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");

      DAO dao = (DAO) x.get("localClusterConfigDAO");
      dao = dao.where(
       AND(
          EQ(ClusterConfig.ENABLED, true),
          NOT(EQ(ClusterConfig.ID, service.getConfigId()))
        )
      );
      dao.select(new ClusterConfigPingSink(x, dao, getTimeout()));

      if ( electoralService != null ) {
      if ( ! service.hasQuorum(x) ) {
        if ( electoralService.getState() == ElectoralServiceState.IN_SESSION) {
          ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "lost quorum");
          electoralService.dissolve(x);
        }
      } else if ( electoralService.getState() == ElectoralServiceState.ADJOURNED ) {
        ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "acquired quorum");
        electoralService.dissolve(x);
      }
      }
      `
    }
  ]
});
