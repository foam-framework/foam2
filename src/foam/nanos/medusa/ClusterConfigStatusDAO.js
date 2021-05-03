/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigStatusDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Monitor the ClusterConfig status and on mediator quorum change, call election, and on node quorum change, re-bucket nodes.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set'
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
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      if ( support.getStandAlone() ) {
        return getDelegate().put_(x, nu);
      }

      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      Boolean hadQuorum = support.hasQuorum(x);
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      if ( nu.getId() == myConfig.getId() ) {
        support.setStatus(nu.getStatus());
      }

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           myConfig.getType() == MedusaType.MEDIATOR &&
           myConfig.getZone() == 0 &&
           nu.getType() == MedusaType.MEDIATOR &&
           myConfig.getRegion() == nu.getRegion() &&
           nu.getZone() == 0 ) {
        getLogger().info(nu.getName(), old.getStatus().getLabel(), "->", nu.getStatus().getLabel().toUpperCase());

        ElectoralService electoralService = (ElectoralService) x.get("electoralService");
        if ( electoralService != null ) {
          if ( support.canVote(x, nu) &&
               support.canVote(x, myConfig) ) {
            Boolean hasQuorum = support.hasQuorum(x);
            if ( electoralService.getState() == ElectoralServiceState.IN_SESSION ||
                 electoralService.getState() == ElectoralServiceState.ADJOURNED) {
              if ( hadQuorum && ! hasQuorum) {
                getLogger().warning("mediator quorum lost");
                electoralService.dissolve(x);
              } else if ( ! hadQuorum && hasQuorum) {
                getLogger().warning("mediator quorum acquired");
                electoralService.dissolve(x);
              } else if ( hasQuorum ) {
                try {
                  support.getPrimary(x);
                  if ( electoralService.getState() != ElectoralServiceState.IN_SESSION ) {
                    // When cluster has quorum, the last mediator may not be in-session.
                    electoralService.register(x, myConfig.getId());
                  }
                } catch ( RuntimeException e ) {
                  // no primary
                  electoralService.dissolve(x);
                }
              }
            }
          }
        }
      }

      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           ( ( myConfig.getType() == MedusaType.MEDIATOR &&
               myConfig.getZone() == 0 ) /*||
             ( myConfig.getType() == MedusaType.NERF &&
               myConfig.getZone() > 0 ) ) */ &&
           nu.getType() == MedusaType.NODE ) ) {
        bucketNodes(x);
      }

      return nu;
      `
    },
    {
      documentation: 'Assign nodes to buckets.',
      synchronized: true,
      name: 'bucketNodes',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      List<ClusterConfig> nodes = ((ArraySink)((DAO) x.get("localClusterConfigDAO"))
        .where(
          AND(
            EQ(ClusterConfig.ENABLED, true),
            EQ(ClusterConfig.STATUS, Status.ONLINE),
            EQ(ClusterConfig.TYPE, MedusaType.NODE),
            EQ(ClusterConfig.ACCESS_MODE, AccessMode.RW),
            EQ(ClusterConfig.ZONE, 0L),
            EQ(ClusterConfig.REGION, myConfig.getRegion()),
            EQ(ClusterConfig.REALM, myConfig.getRealm())
          ))
        .select(new ArraySink())).getArray();
      ArrayList<Set> buckets = new ArrayList();
      for ( ClusterConfig node : nodes ) {
       int index = Math.abs(foam.util.SafetyUtil.hashCode(node.getId())) % support.getNodeGroups();
        if ( node.getBucket() > 0 ) {
          index = node.getBucket() -1;
        }
        if ( index >= buckets.size() ) {
          // create buckets for known gaps
          for ( int i = buckets.size(); i <= index; i++ ) {
            buckets.add(new HashSet());
          }
        }
        Set bucket = (Set) buckets.get(index);
        bucket.add(node.getId());
      }
      support.setNodeBuckets(buckets);
      support.outputBuckets(x);
      `
    },
  ]
});
