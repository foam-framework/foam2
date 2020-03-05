/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityCategory',

  documentation: `
    models a category to which a capability can be associated.
  `,

  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'description',
      documentation: `Description of category`,
      class: 'String'
    }
  ]
});

foam.RELATIONSHIP({
  package: 'foam.nanos.crunch',
  sourceModel: 'foam.nanos.crunch.CapabilityCategory',
  targetModel: 'foam.nanos.crunch.Capability',
  cardinality: '*:*',
  forwardName: 'capabilities',
  inverseName: 'categories'
});
