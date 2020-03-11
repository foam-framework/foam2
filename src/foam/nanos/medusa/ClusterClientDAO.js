/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Marshall put and remove operations to the ClusterServer.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger'
  ],

  properties: [
    {
      documentation: `nSpec service name at the remote node.`,
      name: 'serviceName',
      class: 'String'
    },
    {
      // deprecated - temporary.
      name: 'mdao',
      class: 'foam.dao.DAOProperty',
      visibility: 'HIDDEN'
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
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        getServiceName(),
        "put_",
      }, (Logger) x.get("logger"));

      ElectoralService electoralService = (ElectoralService) x.get("electoralService");
      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( electoralService != null &&
           electoralService.getState() == ElectoralServiceState.IN_SESSION &&
           service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {

        foam.core.FObject old = getDelegate().find_(x, obj.getProperty("id"));
        foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        //TODO: outputDelta has problem when output array. Fix bugs then use output delta.
        // String record = ( old != null ) ?
        //   outputter.stringifyDelta(old, obj) :
        //   outputter.stringify(obj);
        String record = outputter.stringify(obj);
        logger.debug("record", record);
        if ( foam.util.SafetyUtil.isEmpty(record) ||
            "{}".equals(record.trim()) ) {
          logger.debug("no changes");
          return obj;
        }
        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.PUT, record);
        logger.debug("to primary", cmd);

        int retryAttempt = 1;
        int retryDelay = 1;

        while ( ! service.getIsPrimary() ) {
          try {
            logger.debug("retryAttempt", retryAttempt);
            FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
            logger.debug("from primary", result.getClass().getSimpleName(), result);
            obj = obj.copyFrom(result);
            logger.debug("obj after copyFrom", obj);
            return obj;
          } catch ( Throwable t ) {
            if ( getMaxRetryAttempts() > -1 &&
                 retryAttempt >= getMaxRetryAttempts() ) {
              logger.debug("retryAttempt >= maxRetryAttempts", retryAttempt, getMaxRetryAttempts());
              electoralService.dissolve();

              throw t;
            }
            retryAttempt += 1;

            // delay
            try {
              logger.debug("retryDelay", retryDelay);
              Thread.sleep(retryDelay);
              retryDelay *= 2;
              if ( retryDelay > getMaxRetryDelay() ) {
                retryDelay = 1;
              }
            } catch(InterruptedException e) {
              Thread.currentThread().interrupt();
              logger.debug("InterruptedException");
              throw t;
            }
          }
        }
        // we've become primary
        logger.debug("secondary -> primary delegating");
        return getDelegate().put_(x, obj);
      } else {
        logger.debug("primary delegating");
        return getDelegate().put_(x, obj);
      }
      `
    },
    {
      // TODO: refactor  like put.
      name: 'remove_',
      javaCode: `
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        getServiceName(),
        "remove_",
      }, (Logger) x.get("logger"));

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {

       foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        String record = outputter.stringify(obj);

        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.REMOVE, record);
        logger.debug("to primary", cmd);
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
        logger.debug("from primary", result.getClass().getSimpleName(), result);
        obj = obj.copyFrom(result);
        logger.debug("obj after copyFrom", obj);
        return obj;
      } else {
        return getDelegate().remove_(x, obj);
      }
      `
    }
  ]
});
