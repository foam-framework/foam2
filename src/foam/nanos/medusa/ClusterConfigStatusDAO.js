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
    'java.util.Map'
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
      if ( myConfig.getZone() > 0 ) {
        return getDelegate().put_(x, nu);
      }

      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      Boolean hadQuorum = support.hasQuorum(x);
      nu = (ClusterConfig) getDelegate().put_(x, nu);

      if ( old != null &&
           old.getStatus() != nu.getStatus() ) {

        getLogger().info(nu.getName(), old.getStatus().getLabel(), "->", nu.getStatus().getLabel().toUpperCase());

        if ( nu.getId() == support.getConfigId() ) {
          support.setStatus(nu.getStatus());
        }

        if ( nu.getType() == MedusaType.MEDIATOR ) {

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
        } else if ( nu.getType() == MedusaType.NODE ) {
          bucketNodes(x);
        }
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

      int groups = support.getNodeGroups();
      List nodes = ((ArraySink)((DAO) x.get("localClusterConfigDAO"))
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
      Map<Integer, List> buckets = new HashMap();
      for ( int i = 0; i < nodes.size(); i++ ) {
        ClusterConfig node = (ClusterConfig) nodes.get(i);
        int index = i % groups;
        List bucket = (List) buckets.get(index);
        if ( bucket == null ) {
          bucket = new ArrayList<String>();
          buckets.put(index, bucket);
        }
        bucket.add(node.getId());
      }
      support.setNodeBuckets(buckets);
      support.outputBuckets(x);
      `
    },
  ]
});
