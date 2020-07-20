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
      class: 'Array'
    },
    {
      name: 'exception',
      class: 'Object'
    },
    {
      name: 'medusaEntryId',
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.MedusaEntryId'
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
        }
      ],
      javaCode: `
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      if ( getHops() == null ) {
        setHops(new String[] { support.getConfigId() });
      } else {
        String[] hops = new String[getHops().length + 1];
        System.arraycopy(getHops(), 0, hops, 0, getHops().length);
        hops[hops.length - 1] = support.getConfigId();
        setHops(hops);
      }
      `
    }
  ]

});
