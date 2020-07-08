foam.INTERFACE({
  package: 'foam.u2.svg.graph',
  name: 'GridPlacementStrategy',
  documentation: `
    Interface for a strategy for placing objects in a 2D
    coordinate spave
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
      type: 'foam.u2.svg.graph.GridPlacementPlan'
    }
  ]
});