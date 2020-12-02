/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.svg.graph',
  name: 'GridPlacementPlan',

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
        Given an FObject, returns an array of cell coordinates,
        or null if the object hasn't been planned for.
      `
    }
  ]
});
