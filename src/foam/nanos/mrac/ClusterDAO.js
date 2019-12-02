/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `This DAO:
  1. registers a 'server', via NSpec, to handle cluster Client requests which write directly to the delegate (MDAO).
  2. on put() write to primary if not primary, else delegate
  3. recreate clients on configuration changes.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      documentation: `nSpec service name at the remote node.`,
      name: 'serviceName',
      class: 'String'
    },
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {
        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.PUT, obj);
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to primary", cmd);
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
        // temporarily store locally until Medusa
        return getDelegate().put_(x, result);
      } else {
        logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to self", obj);
        return getDelegate().put_(x, obj);
     }
     `
    },
    {
      name: 'remove_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {
        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.REMOVE, obj);
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to primary", cmd);
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
        // temporarily store locally until Medusa
        return getDelegate().remove_(x, obj);
      } else {
        logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to self", obj);
        return getDelegate().remove_(x, obj);
      }
     `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof ClusterCommand ) {
        Logger logger = (Logger) x.get("logger");
        ClusterCommand request = (ClusterCommand) obj;
        X y = request.applyTo(x);
        logger.debug(this.getClass().getSimpleName(), "cmd_", request.getCommand(), getServiceName(), "user", y.get("user"), "agent", y.get("agent"), "request", request);
        if ( ClusterCommand.PUT.equals(request.getCommand()) ) {
          return getDelegate().inX(y).put_(y, request.getObj());
        } else if ( ClusterCommand.REMOVE.equals(request.getCommand()) ) {
          return getDelegate().inX(y).remove_(y, request.getObj());
        } else {
          throw new UnsupportedOperationException(request.getCommand());
        }
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
