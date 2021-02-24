foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'DAGView',
  extends: 'foam.u2.Element',

  classes: [
    {
      name: 'ArrowPlan',
      documentation: 'plan for rendering an arrow',
      properties: [
        { name: 'enterCellLane', class: 'Int' },
        { name: 'exitCellLane', class: 'Int' },
        { name: 'topRowLane', class: 'Int' },
        { name: 'columnLane', class: 'Int' },
        { name: 'bottomRowLane', class: 'Int' }
      ]
    }
  ],

  properties: [
    {
      name: 'graph',
      class: 'FObjectProperty',
      of: 'foam.graph.Graph'
    },
    {
      name: 'gridPlacement_',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.GridPlacementPlan',
      factory: function () {
        return this.RelationshipGridPlacementStrategy.create();
      }
    },
    {
      name: 'nodeView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'rowLanes_',
      factory: () => ({})
    },
    {
      name: 'colLanes_',
      factory: () => ({})
    },
    {
      name: 'cellLanes_',
      factory: () => ({})
    },
    {
      name: 'arrows_',
      class: 'Array'
    }
  ],

  methods: [
    function initE() {
      this.rowLanes_ = {};
      this.colLanes_ = {};
      this.cellLanes_ = {};
      this.arrows_ = [];

    },
    function generateArrows(node, parent) {
      if ( parent ) {
        let parentCoords = this.gridPlacement_.getPlacement(parent);
        let nodeCoords = this.gridPlacement_.getPlacement(node);

        let hasDX = parentCoords[0] - nodeCoords[0] != 0;
        let hasDY = parentCoords[1] - nodeCoords[1] != -1;
        let enterCell = nodeCoords;
        let exitCell = [parentCoords[0], parentCoords[1] + 1];

        let arrow = this.ArrowPlan.create({
          enterCellLane: this.getCellLane(enterCell, parent.id),
          exitCellLane: this.getCellLane(exitCell, parent.id),
        });

        if ( hasDX || hasDY ) {
          let row = parentCoords[1] + 1;
          arrow.topRowLane = this.getLane(this.rowLanes_, row, parent.id);
        }

        if ( hasDY ) {
          let row = nodeCoords[1];
          arrow.bottomRowLane = this.getLane(this.rowLanes_, row, parent.id);
          let col = nodeCoords[0];
          arrow.columnLane = this.getLane(this.colLanes_, col, parent.id);
        }

        this.arrows_.push(arrow);
      }
      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.generateArrows(childNode, node);
      })
    },
    function getCellLane(cell, id) {
      return this.getLane(this.cellLanes_, this.hash_(...cell), id);
    },
    function getLane(laneMap, index, owner) {
      var lanes = laneMap[index] || {};
      for ( let k in lanes ) if ( lanes[k] == owner ) return k;
      var lane = Object.keys(lanes).length;
      laneMap[index] = { ...lanes, [lane]: owner };
      return lane;
    },
    function hash_(x, y) {
      return (x + y) * (x + y + 1) / 2 + x;
    }
  ]
});
