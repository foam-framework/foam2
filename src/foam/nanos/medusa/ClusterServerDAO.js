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
    'foam.dao.DOP',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new foam.nanos.logger.StdoutLogger();
        }
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        ClusterCommand request = (ClusterCommand) obj;

        X y = request.applyTo(x);

        ClusterConfigSupport support = (ClusterConfigSupport) y.get("clusterConfigSupport");
        ClusterConfig config = support.getConfig(y, support.getConfigId());
        ElectoralServiceServer electoralService = (ElectoralServiceServer) y.get("electoralService");
        ClusterConfig primary = support.getPrimary(y);

        getLogger().debug(request.getServiceName(), request.getDop().getLabel(), config.getId(), config.getName(), "isPrimary", config.getIsPrimary(), "primary", primary.getId(), primary.getName(), config.getStatus().getLabel(), "electoral state", electoralService.getState().getLabel());

        if ( ! config.getIsPrimary() ) {
          throw new UnsupportedOperationException("Cluster command not supported on non-primary instance");
        }
        if ( config.getStatus() != Status.ONLINE ) {
          throw new IllegalStateException("Cluster Server not ready.");
        }
        if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ) {
          throw new IllegalStateException("Election in progress");
        }

        DAO dao = (DAO) y.get(request.getServiceName());
        if ( dao == null ) {
          getLogger().error("DAO not found.", request.getServiceName());
          throw new RuntimeException("Service not found: "+request.getServiceName());
        }
        dao = dao.inX(y);

        foam.core.FObject nu = y.create(foam.lib.json.JSONParser.class).parseString(request.getObj());
        if ( nu == null ) {
          getLogger().error("Failed to parse", request.getObj());
          throw new RuntimeException("Error parsing request.");
        }

        foam.core.FObject old = dao.find_(y, nu.getProperty("id"));
        if (  old != null ) {
          nu = old.fclone().copyFrom(nu);
        }

        if ( DOP.PUT == request.getDop() ) {
          return dao.put_(y, nu);
        } else if ( DOP.REMOVE == request.getDop() ) {
          return dao.remove_(y, nu);
        } else {
          getLogger().warning("Unsupported operation", request.getDop().getLabel());
          throw new UnsupportedOperationException(request.getDop().getLabel());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
