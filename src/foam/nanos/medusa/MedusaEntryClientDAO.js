/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntryClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Write MedusaEntry to the Medusa Nodes`,

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.core.FObject',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.net.HttpURLConnection',
    'java.net.URL',
  ],
  
  properties: [
    {
      name: 'clusterConfigId',
      class: 'String'
    },
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaEntryDAO'
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      documentation: 'Set to -1 to infinitely retry.',
      value: 20
    },
    {
      class: 'Int',
      name: 'maxRetryDelay',
      value: 20000
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],
  
  methods: [
    {
      name: 'put_',
      javaCode: `
      int retryAttempt = 0;
      int retryDelay = 10;

      DAO dao = getClientDAO(x);
      while ( true ) {
        try {
          return (FObject) getClientDAO(x).put_(x, obj);
        } catch ( Throwable t ) {
          getLogger().error(t);

          if ( getMaxRetryAttempts() > -1 &&
               retryAttempt >= getMaxRetryAttempts() ) {
            getLogger().warning("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());

            // report, 
            throw new RuntimeException("Rejected, retry limit reached.", t);
          }
          retryAttempt += 1;

          // delay
          try {
            retryDelay *= 2;
            if ( retryDelay > getMaxRetryDelay() ) {
              retryDelay = 10;
            }
            getLogger().debug("retry attempt", retryAttempt, "delay", retryDelay);
            Thread.sleep(retryDelay);
          } catch(InterruptedException e) {
            Thread.currentThread().interrupt();
            getLogger().debug("InterruptedException");
            throw new RuntimeException(e.getMessage(), e);
          }
        }
      }
      `
    },
    {
      name: 'getClientDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaType: 'foam.dao.DAO',
      javaCode: `
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      ClusterConfig config = (ClusterConfig) ((DAO) x.get("clusterConfigDAO")).find(getClusterConfigId());

      DAO dao = new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
        .setSessionID(config.getSessionId())
        .setDelegate(new HTTPBox.Builder(x)
          .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(config.getSessionId())
            .setUrl(service.buildURL(x, getServiceName(), config))
            .build())
           .build())
        .build();
      return dao; 
      `
    },
  ]
});
