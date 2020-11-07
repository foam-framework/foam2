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
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      // new entry
      if ( old == null ||
           old.getEnabled() != nu.getEnabled() ||
           old.getStatus() != nu.getStatus() ) {
        ClusterConfigSupport.NODE_COUNT.clear(support);
        ClusterConfigSupport.NODE_GROUPS.clear(support);
        ClusterConfigSupport.NODE_QUORUM.clear(support);
        ClusterConfigSupport.NODE_REDUNDANCY.clear(support);
        ClusterConfigSupport.HAS_NODE_QUORUM.clear(support);
        ClusterConfigSupport.MEDIATOR_COUNT.clear(support);
        ClusterConfigSupport.HAS_MEDIATOR_QUORUM.clear(support);
//        ClusterConfigSupport.HAS_QUORUM.clear(support);
        ClusterConfigSupport.STAND_ALONE.clear(support);
        ClusterConfigSupport.CLIENTS.clear(support);
        ClusterConfigSupport.BROADCAST_MEDIATORS.clear(support);
        ClusterConfigSupport.NEXT_ZONE.clear(support);
        ClusterConfigSupport.NEXT_SERVER.clear(support);
        ClusterConfigSupport.ACTIVE_REGION.clear(support);
      } else if ( old != null &&
                  old.getPingTime() != nu.getPingTime() ) {
        ClusterConfigSupport.NEXT_ZONE.clear(support);
      } else if ( old != null &&
                  nu.getType() == MedusaType.NODE &&
                  old.getAccessMode() != nu.getAccessMode() ) {
        ClusterConfigSupport.NODE_QUORUM.clear(support);
        ClusterConfigSupport.NODE_REDUNDANCY.clear(support);
      }

      return nu;
      `
    }
  ]
});
