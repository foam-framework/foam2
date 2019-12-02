/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Unpack cmd operation containing a DAO operation and execute it locally.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      Logger log = (Logger) x.get("logger");
      log.debug(this.getClass().getSimpleName(), "cmd_");

      if ( obj instanceof ClusterCommand ) {
        ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
        if ( service == null ||
            ! service.getIsPrimary() ) {
          throw new UnsupportedOperationException("Cluster command not supported on non-primary instance");
        }

        ClusterCommand request = (ClusterCommand) obj;
        X y = request.applyTo(x);
        Logger logger = (Logger) y.get("logger");

        logger.debug(this.getClass().getSimpleName(), "cmd_", request.getCommand(), request.getServiceName(), "user", y.get("user"), "agent", y.get("agent"), "request", request);
        DAO dao = (DAO) x.get(request.getServiceName());
        if ( dao == null ) {
          logger.error(this.getClass().getSimpleName(), "cmd_", "DAO not found", request.getServiceName());
          throw new RuntimeException("Cluster requested service not found: "+request.getServiceName());
        }
        if ( ClusterCommand.PUT.equals(request.getCommand()) ) {
          return dao.inX(y).put_(y, request.getObj());
        } else if ( ClusterCommand.REMOVE.equals(request.getCommand()) ) {
          return dao.inX(y).remove_(y, request.getObj());
        } else {
          throw new UnsupportedOperationException(request.getCommand());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
