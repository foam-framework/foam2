/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'PredeterminedGridPlacementPlan',
  implements: ['foam.u2.svg.graph.GridPlacementPlan'],

  properties: [
    {
      name: 'coords',
      class: 'Map'
    },
    {
      name: 'shape',
      class: 'Array'
    }
  ],

  methods: [
    {
      name: 'getPlacement',
      code: function getPlacement(id) {
        return this.coords[id] || null;
      }
    },
    function addAssociation_(id, coords) {
      this.coords[id] = coords;
      for ( let i = 0 ; i < coords.length ; i++ ) {
        this.shape[i] = Math.max(coords[i] + 1, this.shape[i]);
      }
    }
  ]
});