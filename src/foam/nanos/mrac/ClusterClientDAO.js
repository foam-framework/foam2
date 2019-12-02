/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterClientDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: '',

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
      name: 'mdao',
      class: 'foam.dao.DAOProperty',
      vibility: 'HIDDEN'
    }
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
      Logger logger = new PrefixLogger(new Object[] {
        this.getClass().getSimpleName(),
        "put_",
        getServiceName()
      }, (Logger) x.get("logger"));

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {
        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.PUT, obj);
        logger.debug("to primary", cmd);
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName()).cmd_(x, cmd);
        logger.debug("from primary", result);
        // temporarily store locally until Medusa
        //return getDelegate().put_(x, result);
        //return getDelegate().put_(x, obj);
        return getMdao().put_(x, result); // does not work for password updates.
      } else {
        //logger.debug(this.getClass().getSimpleName(), "put_", getServiceName(), "to self", obj);
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
        //logger.debug(this.getClass().getSimpleName(), "remove_", getServiceName(), "to self", obj);
        return getDelegate().remove_(x, obj);
      }
     `
    }
  ]
});
