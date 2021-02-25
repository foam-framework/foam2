/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'ArrowDisplaceCellsPlacementPlan',
  implements: ['foam.u2.svg.map2d.PlacementPlan'],

  documentation: `
    This is a convenient GridPlacementPlan for predetermined cell placements.
  `,

  properties: [
    {
      name: 'gridGap',
      class: 'Int',
      value: 20
    },
    {
      name: 'cellSize',
      class: 'Int',
      value: 100
    },
    {
      name: 'displacementFactor',
      class: 'Int',
      value: 12
    },
    {
      name: 'colDisplacement_',
      class: 'Map'
    },
    {
      name: 'rowDisplacement_',
      class: 'Map'
    },
    {
      name: 'gridPlacementPlan',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.GridPlacementPlan'
    },
    {
      name: 'width',
      getter: function () {
        let v = (this.cellSize + this.gridGap) * this.gridPlacementPlan.shape[0];
        for ( let k in this.colDisplacement_ ) {
          v += this.colDisplacement_[k] * this.displacementFactor;
        }
        return v;
      }
    },
    {
      name: 'height',
      getter: function () {
        let v = (this.cellSize + this.gridGap) * this.gridPlacementPlan.shape[1];
        for ( let k in this.rowDisplacement_ ) {
          v += this.rowDisplacement_[k] * this.displacementFactor;
        }
        return v;
      }
    }
  ],

  methods: [
    {
      name: 'getPlacement',
      code: function getPlacement(id) {
        var cellPosition = this.gridPlacementPlan.getPlacement(id);
        if ( ! cellPosition ) return null;

        var x = (this.cellSize + this.gridGap) * cellPosition[0];
        var y = (this.cellSize + this.gridGap) * cellPosition[1];
        for ( let i = 0 ; i <= cellPosition[0] ; i++ ) {
          if ( ! this.colDisplacement_.hasOwnProperty(i) ) continue;
          x += this.colDisplacement_[i] * this.displacementFactor;
        }
        for ( let i = 0 ; i <= cellPosition[1] ; i++ ) {
          if ( ! this.rowDisplacement_.hasOwnProperty(i) ) continue;
          y += this.rowDisplacement_[i] * this.displacementFactor;
        }

        return [x, y];
      }
    },
    function getRowLanePosition(row, lane) {
      return this.getLaneDisplacement_(this.rowDisplacement_, row, lane);
    },
    function getColLanePosition(col, lane) {
      return this.getLaneDisplacement_(this.colDisplacement_, col, lane);
    },
    function getLaneDisplacement_(map, index, lane) {
      var v = (this.cellSize + this.gridGap) * index;
      for ( let i = 0 ; i < index ; i++ ) {
        if ( ! map.hasOwnProperty(i) ) continue;
        v += map[i] * this.displacementFactor;
      }
      v += lane * this.displacementFactor;
      return v;
    },
    function makeRoomInRow(row, lanes) {
      this.rowDisplacement_[row] = lanes;
    },
    function makeRoomInCol(col, lanes) {
      this.colDisplacement_[col] = lanes;
    }
  ]
});
