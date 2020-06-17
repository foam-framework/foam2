/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterServerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'process ClusterClientDAO operations against server side MDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
  ],

  properties: [
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
    }
  ],

  constants: [
    {
      name: 'GET_CLIENT_CMD',
      value: 'GET_CLIENT_CMD',
      type: 'String'
    }
  ],

  methods: [
    {
      name: 'getClientDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'cmd',
          type: 'foam.nanos.medusa.ClusterCommand'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      DAO dao = (DAO) x.get(cmd.getServiceName());

      if ( dao != null ) {
        dao = (DAO) dao.cmd_(x, GET_CLIENT_CMD);
        if ( dao != null ) {
          if ( dao instanceof ClusterClientDAO ) {
            ClusterClientDAO client = (ClusterClientDAO) dao;
            if ( config.getId().equals(cmd.getHops()[cmd.getHops().length - 1]) ) {
              // short circuiting - self to self.
              getLogger().debug("short circuit");
              return null;
            }
          }
          return dao;
        }
      }
      return null;
      `
    },
    {
      name: 'getMDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'cmd',
          type: 'foam.nanos.medusa.ClusterCommand'
        }
      ],
      type: 'foam.dao.DAO',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      DAO dao = support.getMdao(x, cmd.getServiceName());
      if ( dao == null ) {
        getLogger().error("Service not found", cmd.getServiceName());
        Throwable cause = new IllegalArgumentException("Service not found: "+cmd.getServiceName());
        throw new ClusterException(cause.getMessage(), cause);
      }
      return dao;
      `
    },
    {
      name: 'put_',
      javaCode: `
      ClusterCommand cmd = (ClusterCommand) obj;
      getLogger().debug("put_", "ClusterCommand", java.util.Arrays.toString(cmd.getHops()));

      DAO dao = getClientDAO(x, cmd);
      if ( dao != null ) {
        return dao.put_(x, cmd);
      }
      dao = getMDAO(x, cmd);

      FObject nu = cmd.getData();
      getLogger().debug("put_", "find_", nu.getClass().getSimpleName(), nu.getProperty("id"));
      FObject old = dao.find_(x, nu.getProperty("id"));
      if (  old != null ) {
         nu = old.fclone().copyFrom(nu);
      }
      return dao.put_(x, nu);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      ClusterCommand cmd = (ClusterCommand) obj;
      getLogger().debug("remove_", "ClusterCommand", java.util.Arrays.toString(cmd.getHops()));

      DAO dao = getClientDAO(x, cmd);
      if ( dao != null ) {
        return dao.remove_(x, cmd);
      }
      dao = getMDAO(x, cmd);
      return dao.remove_(x, cmd.getData());
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( ! (obj instanceof ClusterCommand) ) {
        DAO delegate = getDelegate();
        if ( delegate != null ) {
          return delegate.cmd_(x, obj);
        }
        return obj;
      }

      ClusterCommand cmd = (ClusterCommand) obj;
      getLogger().debug("cmd_", "ClusterCommand", java.util.Arrays.toString(cmd.getHops()));
      DAO dao = getClientDAO(x, cmd);
      if ( dao != null ) {
        return dao.cmd_(x, cmd);
      }
      dao = getMDAO(x, cmd);

      if ( DOP.PUT == cmd.getDop() ) {
        return dao.put_(x, cmd.getData());
      } else if ( DOP.REMOVE == cmd.getDop() ) {
        return dao.remove_(x, cmd.getData());
      } else {
        getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
        throw new ClusterException("Unsupported operation: "+cmd.getDop().getLabel(), new UnsupportedOperationException(cmd.getDop().getLabel()));
      }
      `
    }
  ]
});
