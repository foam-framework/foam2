/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterTopologySink',
  extends: 'foam.dao.AbstractSink',

  documentation: 'Attempt to contact Nodes and Mediators, acquire ClusterConfig',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ClusterTopologySink(foam.core.X x, foam.dao.DAO dao) {
            setX(x);
            setDao(dao);
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
      ClusterConfig config = (ClusterConfig) obj;
      try {
        DAO dao = support.getClientDAO(getX(), "clusterConfigDAO", myConfig, config);
        ClusterConfig remote = (ClusterConfig) dao.find(config.getId());
        // getLogger().debug(config.getId(), "remote", remote);
        if ( remote != null ) {
          remote = (ClusterConfig) remote.fclone();
          config = (ClusterConfig) getDao().put_(getX(), remote);
        }
      } catch (Throwable t) {
        getLogger().warning(config.getId(), t.getClass().getSimpleName(), t.getMessage());
        config = (ClusterConfig) config.fclone();
        Throwable cause = t.getCause();
        if ( cause != null &&
             cause instanceof java.net.ConnectException ) {
          // Assuming timeout - so mark offline.
          config.setStatus(Status.OFFLINE);
          config.setErrorMessage(cause.getMessage());
        } else {
          config.setErrorMessage(t.getMessage());
        }
        config = (ClusterConfig) getDao().put_(getX(), config);
      }
      `
    },
    {
      // avoid null pointer on ProxySink.eof()
      name: 'eof',
      javaCode: `//nop`
    }
  ]
});
