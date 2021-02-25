/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.svg.map2d',
  name: 'GridPlacementStrategy',
  documentation: `
    Provides a plan for placing objects in a 2D coordinate space.
  `,

  properties: [
    {
      name: 'data',
      class: 'foam.dao.DAOProperty',
    },
  ],

  methods: [
    {
      name: 'getPlan',
      type: 'foam.u2.svg.map2d.GridPlacementPlan'
    }
  ]
});
