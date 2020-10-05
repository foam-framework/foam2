/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.crunchtest',
  name: 'TestCapable',
  implements: [ 'foam.nanos.crunch.lite.Capable' ],
  documentation: `
    Object implementing Capable to do testing with.
  `,

  properties: [
    {
      name: 'id',
      class: 'String',
    },
    // Grab properties from CapableObjectData
    ...(
      foam.nanos.crunch.lite.CapableObjectData
        .getOwnAxiomsByClass(foam.core.Property)
        .map(p => p.clone())
    )
  ],

  methods: [
    // Grab methods from CapableObjectData
    ...(
      foam.nanos.crunch.lite.CapableObjectData
        .getOwnAxiomsByClass(foam.core.Method)
        .map(p => p.clone())
    )
  ]
});