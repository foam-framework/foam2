/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Unpack cmd operation containing a DAO operation and execute it locally.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger'
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        ClusterCommand request = (ClusterCommand) obj;
        X y = request.applyTo(x);

        Logger logger = new PrefixLogger(new Object[] {
          this.getClass().getSimpleName(),
          "cmd_",
           request.getServiceName(),
           request.getCommand()
        }, (Logger) y.get("logger"));

        ClusterConfigService service = (ClusterConfigService) y.get("clusterConfigService");
        ElectoralServiceServer electoralService = (ElectoralServiceServer) y.get("electoralService");

        logger.debug("isPrimary", service.getIsPrimary(), "electoral state", electoralService.getState().getLabel());

        if ( ! service.getIsPrimary() ) {
          throw new UnsupportedOperationException("Cluster command not supported on non-primary instance");
        }
        if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ) {
          throw new RuntimeException("Election in progress");
        }

        logger.debug(request);

        DAO dao = (DAO) y.get(request.getServiceName());
        if ( dao == null ) {
          logger.error("DAO not found");
          throw new RuntimeException("Cluster requested service not found: "+request.getServiceName());
        }
        dao = dao.inX(y);

        foam.core.FObject nu = y.create(foam.lib.json.JSONParser.class).parseString(request.getObj());
        if ( nu == null ) {
          logger.error("Failed to parse", request.getObj());
          throw new RuntimeException("Error parsing request.");
        }

        foam.core.FObject old = dao.find_(x, nu.getProperty("id"));
        if (  old != null ) {
          nu = old.fclone().copyFrom(nu);
        }

        if ( ClusterCommand.PUT.equals(request.getCommand()) ) {
          return dao.put_(y, nu);
        } else if ( ClusterCommand.REMOVE.equals(request.getCommand()) ) {
          return dao.remove_(y, nu);
        } else {
          logger.warning("Unsupported operation", request.getCommand());
          throw new UnsupportedOperationException(request.getCommand());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
