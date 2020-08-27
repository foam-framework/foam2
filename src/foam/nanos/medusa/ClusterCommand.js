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
    // addHop(x);
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
      name: 'addHop',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'op',
          type: 'String'
        },
        {
          name: 'hostname',
          type: 'String'
        }
      ],
      type: 'foam.nanos.medusa.ClusterCommand',
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      if ( foam.util.SafetyUtil.isEmpty(hostname) ) {
        hostname = support.getConfigId();
      }
      if ( getHops() == null ) {
        setHops(new ClusterCommandHop[] { new ClusterCommandHop(hostname, op) });
      } else {
        ClusterCommandHop[] hops = new ClusterCommandHop[getHops().length + 1];
        System.arraycopy(getHops(), 0, hops, 0, getHops().length);
        hops[hops.length - 1] = new ClusterCommandHop(hostname, op);
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
      Logger logger = (Logger) x.get("logger");
      ClusterCommandHop[] hops = (ClusterCommandHop[]) getHops();
      long timestamp = hops[0].getTimestamp();
      long starttime = timestamp;
      logger.debug("ClusterCommandHop", "hostname", "op", "time");
      for ( ClusterCommandHop hop : hops ) {
        logger.debug("ClusterCommandHop", hop.getHostname(), hop.getOp(), timestamp-hop.getTimestamp());
        timestamp = hop.getTimestamp();
      }
      logger.debug("ClusterCommandHop", "total", hops.length, timestamp-starttime);
      `
    }
  ]
});
