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
      visibility: 'HIDDEN'
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

      ClusterConfigService service = (ClusterConfigService) x.get("clusterConfigService");
      if ( service != null &&
           service.getConfig() != null &&
           ! service.getIsPrimary() ) {
        foam.core.FObject old = getMdao().find_(x, obj.getProperty("id"));
        foam.lib.json.Outputter outputter = new foam.lib.json.Outputter(x).setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        String record = ( old != null ) ?
          outputter.stringifyDelta(old, obj) :
          outputter.stringify(obj);
        logger.debug("record", record);
        if ( foam.util.SafetyUtil.isEmpty(record) ||
            "{}".equals(record.trim()) ) {
          logger.debug("no changes");
          // temporarily store locally until Medusa
          //return obj;
          return getDelegate().put_(x, obj);
        }

        ClusterCommand cmd = new ClusterCommand(x, getServiceName(), ClusterCommand.PUT, record);
        logger.debug("to primary", cmd);
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName(), (foam.dao.DAO) getMdao()).cmd_(x, cmd);
        logger.debug("from primary", result.getClass().getSimpleName(), result);
        obj = obj.copyFrom(result);
        // temporarily store locally until Medusa
        // return obj;
        logger.debug("obj after copyFrom", obj);
        return getMdao().put_(x, obj); // does not work for password updates.
      } else {
        return getDelegate().put_(x, obj);
      }
      `
    },
    {
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
        FObject result = (FObject) service.getPrimaryDAO(x, getServiceName(), (foam.dao.DAO) getMdao()).cmd_(x, cmd);
        logger.debug("from primary", result.getClass().getSimpleName(), result);
        obj = obj.copyFrom(result);
        // temporarily store locally until Medusa
        // return obj;
        logger.debug("obj after copyFrom", obj);
        return getMdao().remove_(x, obj);
      } else {
        return getDelegate().remove_(x, obj);
      }
      `
    }
  ]
});
