/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaRegionDAO',
  extends: 'foam.dao.BatchClientDAO',

  documentation: 'If own region is active, delegate locally, else send to an active region.',

  javaImports: [
    'foam.core.ContextAware',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.BatchCmd',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      documentation: `DAO nSpec service name which the remote must route.`,
      name: 'serviceName',
      class: 'String',
      value: 'medusaMediatorDAO'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          getServiceName()
        }, (Logger) getX().get("logger"));
      `,
      transient: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      getLogger().debug("put", config.getRegionStatus().getLabel());
      if ( config.getRegionStatus() == RegionStatus.STANDBY ) {
        return super.put_(x, obj);
      }
      return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( ! ( obj instanceof BatchCmd ) ) {
        return getDelegate().cmd_(x, obj);
      }

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      ClusterConfig primary = support.getPrimary(x);
      ClusterConfig region = support.getActiveRegion(x, config);

      getLogger().debug("cmd", "client", config.getName(), config.getStatus().getLabel(), config.getRegionStatus().getLabel(), "primary", primary.getName(), "region", region.getName());

      int retryAttempt = 0;
      int retryDelay = 10;

      while ( config.getRegionStatus() == RegionStatus.STANDBY ) {
        try {
          if ( config.getStatus() != Status.ONLINE ) {
            throw new IllegalStateException("Cluster not ready.");
          }
          getLogger().debug("cmd", "to region", region.getName(), "attempt", retryAttempt);
          PM pm = new PM(MedusaRegionDAO.getOwnClassInfo(), getServiceName());
          FObject result = (FObject) support.getClientDAO(x, getServiceName(), config, region).cmd_(x, obj);
          pm.log(x);
          getLogger().debug("cmd", "from region", region.getName(), "attempt", retryAttempt);
          return result;
        } catch ( Throwable t ) {
          if ( t instanceof UnsupportedOperationException ) {
            // primary has changed
            getLogger().debug(t.getMessage());
          } else {
            getLogger().error(t.getMessage(), t);
            throw t;
          }
          if ( support.getMaxRetryAttempts() > -1 &&
               retryAttempt == support.getMaxRetryAttempts() ) {
            getLogger().debug("retryAttempt >= maxRetryAttempts", retryAttempt, support.getMaxRetryAttempts());
              throw t;
            }
            retryAttempt += 1;

            // delay
            try {
              retryDelay *= 2;
              if ( retryDelay > support.getMaxRetryDelay() ) {
                retryDelay = 10;
              }
              getLogger().debug("retry attempt", retryAttempt, "delay", retryDelay);
              Thread.sleep(retryDelay);
           } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              getLogger().debug("InterruptedException");
              throw t;
            }
          }
          // refresh
          config = support.getConfig(x, support.getConfigId());
          primary = support.getPrimary(x);
          region = support.getPrimary(x);
        }

        getLogger().debug("region delegating");
        return getDelegate().cmd_(x, obj);
      `
    },
  ]
});
