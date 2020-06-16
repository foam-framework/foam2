/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigSupportDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Monitor the ClusterConfig DAO and resets a selection of ClusterConfigSupport properties when configuration changes.`,

  javaImports: [
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));

      `
    },
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfig nu = (ClusterConfig) obj;
      getLogger().debug("put", nu.getName());
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      // new entry
      if ( old == null ) {
        ClusterConfigSupport.NODE_COUNT.clear(support);
        ClusterConfigSupport.NODE_GROUPS.clear(support);
//        ClusterConfigSupport.NODE_QUORUM.clear(support);
        ClusterConfigSupport.MEDIATOR_COUNT.clear(support);
        ClusterConfigSupport.STAND_ALONE.clear(support);
        ClusterConfigSupport.CLIENTS.clear(support);
      }

      return nu;
      `
    }
  ]
});
