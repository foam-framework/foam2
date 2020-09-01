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
    'foam.core.Agency',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ClusterConfigPingSink(foam.core.X x, foam.dao.DAO dao) {
            setX(x);
            setDao(dao);
          }
        `);
      }
    }
  ],

  properties: [
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
      final ClusterConfig config = (ClusterConfig) obj;

      Agency agency = (Agency) getX().get("threadPool");
      agency.submit(getX(), new ContextAgent() {
        public void execute(X x) {
          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
          DAO client = support.getClientDAO(x, "clusterConfigDAO", myConfig, config);
          PM pm = new PM("ClusterConfigPingSink", config.getId());
          try {
            ClusterConfig cfg = (ClusterConfig) client.find_(x, config.getId());
            pm.log(x);
            if ( cfg != null ) {
              cfg.setPingTime(pm.getEndTime().getTime() - pm.getStartTime().getTime());
              getDao().put_(x, cfg);
            } else {
              getLogger().warning("client,find,returned,null");
            }
          } catch ( Throwable t ) {
            pm.error(x, t);
            getLogger().debug(config.getId(), t.getClass().getSimpleName(), t.getMessage());
            if ( config.getStatus() != Status.OFFLINE ) {
              ClusterConfig cfg = (ClusterConfig) config.fclone();
              cfg.setStatus(Status.OFFLINE);
              getDao().put_(x, cfg);
              // TODO: Alarm.
            }
          }
        }
      }, this.getClass().getSimpleName());
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
