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

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterCommand cmd = (ClusterCommand) obj;
      DAO dao = (DAO) x.get(cmd.getServiceName());
      if ( dao == null ) {
        getLogger().error("DAO not found", cmd.getServiceName());
        throw new ClusterException("DAO not found");
      }
      getLogger().debug("put_", java.util.Arrays.toString(cmd.getHops()));

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
      DAO dao = (DAO) x.get(cmd.getServiceName());
      if ( dao == null ) {
        getLogger().error("DAO not found", cmd.getServiceName());
        throw new ClusterException("DAO not found");
      }
      getLogger().debug("remove_", java.util.Arrays.toString(cmd.getHops()));
      return dao.remove_(x, cmd.getData());
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      ClusterCommand cmd = (ClusterCommand) obj;
      getLogger().debug("cmd_", java.util.Arrays.toString(cmd.getHops()));
      DAO dao = (DAO) x.get(cmd.getServiceName());
      if ( dao == null ) {
        getLogger().error("DAO not found", cmd.getServiceName());
        throw new ClusterException("DAO not found");
      }
      return dao.cmd_(x, obj);
      `
    }
  ]
});
