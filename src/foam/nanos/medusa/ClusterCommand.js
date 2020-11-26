/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterCommand',

  documentation: `Container for marshalling DAO operation between client and server.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.Random',
    'java.util.UUID'
  ],

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'retry',
      class: 'Long'
    },
    {
      name: 'serviceName',
      class: 'String'
    },
    {
      name: 'dop',
      class: 'Enum',
      of: 'foam.dao.DOP',
    },
    {
      name: 'data',
      class: 'FObjectProperty'
    },
    {
      name: 'hops',
      class: 'FObjectArray',
      of: 'foam.nanos.medusa.ClusterCommandHop',
      tableCellFormatter: function(value) {
        this.add(value && value.map(function(hop) { return hop.hostname; }).join());
      }
    },
    {
      name: 'exception',
      class: 'Object'
    },
    {
      name: 'medusaEntryId',
      class: 'Long'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ClusterCommand(X x, String serviceName, DOP dop, FObject data) {
    setServiceName(serviceName);
    setDop(dop);
    setData(data);
    java.util.Random r = ThreadLocalRandom.current();
    setId(new UUID(r.nextLong(), r.nextLong()).toString());
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      documentation: `Record path through the network for troubleshooting.`,
      name: 'addHop',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
        {
          name: 'op',
          type: 'String'
        }
      ],
      type: 'foam.nanos.medusa.ClusterCommand',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterCommandHop[] existing = getHops();
      if ( existing == null ||
           existing.length == 0 ) {
        setHops(new ClusterCommandHop[] { new ClusterCommandHop(support.getConfigId(), dop, op) });
      } else {
        // set destination on previous hop
        ClusterCommandHop hop = existing[existing.length -1];
        PM pm = hop.getPm();
        pm.setEndTime(System.currentTimeMillis());
        pm.setName(PM.combine(pm.getName(), support.getConfigId()));
        // start next hop
        ClusterCommandHop[] hops = new ClusterCommandHop[existing.length + 1];
        System.arraycopy(existing, 0, hops, 0, existing.length);
        hops[hops.length - 1] = new ClusterCommandHop(support.getConfigId(), dop, op);
        setHops(hops);
      }
      return this;
      `
    },
    {
      name: 'logHops',
      args: [
        {
          name: 'x',
          type: 'X'
        }
      ],
      javaCode: `
      ClusterCommandHop[] hops = (ClusterCommandHop[]) getHops();
      for ( ClusterCommandHop hop : hops ) {
        PM pm = hop.getPm();
        pm.log(x);
      }
      `
    }
  ]
});
