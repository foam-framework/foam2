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
    'foam.dao.EasyDAO',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.dao.MDAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.Map',
    'java.util.HashMap',
  ],

  properties: [
    {
      name: 'mdaos',
      class: 'Map',
      javaFactory: 'return new HashMap();',
      visibility: 'HIDDEN'
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
      name: 'cmd_',
      javaCode: `
      if ( ! (obj instanceof ClusterCommand) ) {
        return getDelegate().cmd_(x, obj);
      }

      ClusterCommand cmd = (ClusterCommand) obj;
      getLogger().info("cmd", "ClusterCommand", java.util.Arrays.toString(cmd.getHops()), cmd.getDop().getLabel());

      FObject nu = cmd.getData();

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig config = support.getConfig(x, support.getConfigId());
      DAO dao = (DAO) x.get(cmd.getServiceName());

      if ( dao != null ) _shortCircuit: {
        dao = (DAO) dao.cmd_(x, GET_CLIENT_CMD);
        if ( dao != null ) {
          if ( dao instanceof ClusterClientDAO ) {
            ClusterClientDAO client = (ClusterClientDAO) dao;
            if ( config.getId().equals(cmd.getHops()[cmd.getHops().length - 1]) ) {
              // short circuiting - self to self.
              getLogger().debug("short circuit");
              break _shortCircuit;
            }
          }
          return dao.cmd_(x, cmd);
        }
      }
 
      dao = support.getMdao(x, cmd.getServiceName());
      if ( dao == null ) {
        getLogger().error("Service not found", cmd.getServiceName());
        throw new IllegalArgumentException("Service not found: "+cmd.getServiceName());
     }

      FObject old = dao.find_(x, nu.getProperty("id"));
      if (  old != null ) {
        nu = old.fclone().copyFrom(nu);
      }

      if ( DOP.PUT == cmd.getDop() ) {
        cmd.setData(dao.put_(x, nu));
      } else if ( DOP.REMOVE == cmd.getDop() ) {
        cmd.setData(dao.remove_(x, nu));
      } else {
        getLogger().warning("Unsupported operation", cmd.getDop().getLabel());
        throw new UnsupportedOperationException(cmd.getDop().getLabel());
      }
      return cmd;
      `
    }
  ]
});
