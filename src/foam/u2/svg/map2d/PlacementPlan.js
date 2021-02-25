/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.svg.map2d',
  name: 'PlacementPlan',
  documentation: `
    Provides a mapping for FObjects to pixel coordinates.
  `,

  properties: [
    {
      name: 'shape',
      class: 'Array',
      documentation: `
        Dimensions of grid (width, height) as an array.
      `
    },
  ],

  methods: [
    {
      name: 'getPlacement',
      type: 'Array',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      documentation: `
        Given an FObject, returns an array of pixel coordinates,
        or null if the object cannot be mapped.
      `
    }
  ]
});
