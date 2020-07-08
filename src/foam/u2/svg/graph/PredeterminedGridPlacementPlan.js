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
      code: function getPlacement(obj) {
        return this.coords[obj.id] || null;
      }
    },
    function addAssociation_(id, coords) {
      this.coords[id] = coords;
      for ( let i = 0 ; i < coords.length ; i++ ) {
        this.coords[i] = Math.max(coords[i] + 1, this.coords[i]);
      }
    }
  ]
});