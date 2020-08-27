/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterCommandHop',

  documentation: `Record a hop through Medusa cluster.`,

  properties: [
    {
      name: 'hostname',
      class: 'String'
    },
    {
      name: 'op',
      class: 'String',
      value: 'sendTo'
    },
    {
      name: 'timestamp',
      class: 'Long'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ClusterCommandHop(String hostname) {
    setHostname(hostname);
    setOp("sendTo");
    setTimestamp(System.currentTimeMillis());
  }

  public ClusterCommandHop(String hostname, String op) {
    setHostname(hostname);
    setOp(op);
    setTimestamp(System.currentTimeMillis());
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: `
      return this.getHostname()+":"+this.getOp();
      `
    }
  ]
});
