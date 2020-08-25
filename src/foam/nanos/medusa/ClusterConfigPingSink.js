/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigPingSink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Attempt to contact Nodes and Mediators, record ping time and mark them ONLINE or OFFLINE.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.http.Ping',
    'foam.nanos.http.PingService',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ClusterConfigPingSink(foam.core.X x, foam.dao.DAO dao, int timeout) {
            setX(x);
            setDao(dao);
            setTimeout(timeout);
          }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'timeout',
      class: 'Int',
      value: 3000,
    },
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty'
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
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      ClusterConfig config = (ClusterConfig) ((FObject)obj).fclone();
      ClusterPingService pingService = (ClusterPingService) getX().get("mping");
      try {
        Status status = pingService.ping(getX(), config.getId(), config.getPort(), getTimeout(), config.getUseHttps());
        // getLogger().debug("config.status", config.getStatus(), "status", status);
        if ( status == null ) {
          status = Status.OFFLINE;
        }
        // TODO: Alarm if ONLINE -> OFFLINE
        // TODO: clear Alarm if OFFLINE -> ONLINE
        if ( status != config.getStatus() ) {
          config.setStatus(status);
          config = (ClusterConfig) getDao().put_(getX(), config);
        }
      } catch (java.io.IOException | RuntimeException t) {
        getLogger().debug(config.getId(), t.getClass().getSimpleName(), t.getMessage());
        if ( config.getStatus() != Status.OFFLINE ) {
          config.setStatus(Status.OFFLINE);
          config = (ClusterConfig) getDao().put_(getX(), config);
        // TODO: Alarm.
        }
      }
      `
    },
    {
      name: 'eof',
      javaCode: `
      //nop
      `
    }
  ]
});
