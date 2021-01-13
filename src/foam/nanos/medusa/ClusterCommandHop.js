/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterCommandHop',

  documentation: `Record a hop through Medusa cluster.`,

  javaImports: [
    'foam.dao.DOP',
    'foam.nanos.pm.PM'
  ],
  
  properties: [
    {
      name: 'hostname',
      class: 'String'
    },
    {
      name: 'pm',
      class: 'FObjectProperty',
      of: 'foam.nanos.pm.PM'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ClusterCommandHop(String hostname, DOP dop, String op) {
    setHostname(hostname);
    setPm(new PM(this.getClass().getSimpleName(), hostname, dop.getLabel(), op));
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
      return this.getHostname();
      `
    }
  ]
});
