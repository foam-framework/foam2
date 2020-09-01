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
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
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
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(getX(), support.getConfigId());
      ClusterConfig config = (ClusterConfig) ((FObject)obj).fclone();
      DAO client = support.getClientDAO(getX(), "clusterConfigDAO", myConfig, config);
      try {
        ClusterConfig cfg = (ClusterConfig) client.find_(getX(), config.getId());
        if ( cfg != null ) {
          getDao().put_(getX(), cfg);
        }
      } catch ( RuntimeException t ) {
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
