/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Monitor the ClusterConfig status and call election when quorum changes`,

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

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      Boolean hadQuorum = support.hasQuorum(x);

      nu = (ClusterConfig) getDelegate().put_(x, nu);

      if ( old != null &&
           old.getStatus() != nu.getStatus() ) {

        getLogger().info(nu.getName(), old.getStatus().getLabel(), "->", nu.getStatus().getLabel().toUpperCase());

        if ( nu.getId() == support.getConfigId() ) {
          support.setStatus(nu.getStatus());
        }

        ElectoralService electoralService = (ElectoralService) x.get("electoralService");
        if ( electoralService != null ) {
          ClusterConfig config = support.getConfig(x, support.getConfigId());
          if ( support.canVote(x, nu) &&
               support.canVote(x, config) ) {
            Boolean hasQuorum = support.hasQuorum(x);
            if ( electoralService.getState() == ElectoralServiceState.IN_SESSION ||
                 electoralService.getState() == ElectoralServiceState.ADJOURNED) {
              if ( hadQuorum && ! hasQuorum) {
                getLogger().warning(this.getClass().getSimpleName(), "mediator quorum lost");
              } else if ( ! hadQuorum && hasQuorum) {
                getLogger().warning(this.getClass().getSimpleName(), "mediator quorum acquired");
              } else {
                getLogger().info(this.getClass().getSimpleName(), "mediator quorum membership change");
              }
              electoralService.dissolve(x);
            }
          }
        }
      }
      return nu;
      `
    }
  ]
});
