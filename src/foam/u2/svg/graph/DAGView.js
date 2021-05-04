/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'DAGView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.u2.svg.graph.ArrowDisplaceCellsPlacementPlan',
    'foam.u2.svg.arrow.VHVArrowLine',
    'foam.u2.svg.arrow.SimpleArrowHead',
    'foam.u2.svg.arrow.SegmentedArrowLine',
  ],

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
      name: 'nodeView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'cellSize',
      documentation: `Size of each cell as one dimension of a square`,
      class: 'Int',
      value: 100
    },
    {
      name: 'gridGap',
      documentation: `Number of pixels between each item before adjustments`,
      class: 'Int',
      value: 20
    },
    {
      name: 'gridPlacement',
      documentation: `Plan to place objects on a grid before adjustments`,
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.GridPlacementPlan'
    },
    {
      name: 'placement_',
      class: 'FObjectProperty',
      of: 'foam.u2.svg.map2d.PlacementPlan',
      factory: function () {
        return this.ArrowDisplaceCellsPlacementPlan.create({
          gridPlacementPlan$: this.gridPlacement$,
          gridGap$: this.gridGap$,
          cellSize$: this.cellSize$
        })
      }
    },
    {
      name: 'nodeView',
      class: 'foam.u2.ViewSpec'
    },
    {
      name: 'zoom',
      class: 'Float'
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
    },
    {
      name: 'alreadyRendered_',
      class: 'Map'
    }
  ],

  methods: [
    function initE() {
      this.rowLanes_ = {};
      this.colLanes_ = {};
      this.cellLanes_ = {};
      this.arrows_ = [];
      this.alreadyRendered_ = {};

      // Plan how to draw the arrows
      this.graph.roots.forEach(node => {
        this.generateArrows(node);
      });

      // Create a placement plan that leaves room for arrows
      for ( let row in this.rowLanes_ ) {
        this.placement_.makeRoomInRow(row,
          Object.keys(this.rowLanes_[row]).length);
      }
      for ( let col in this.colLanes_ ) {
        this.placement_.makeRoomInCol(col,
          Object.keys(this.colLanes_[col]).length);
      }

      var g = this.start('svg');
      g.attrs({
        'xmlns': 'http://www.w3.org/2000/svg',
        'viewBox': '0 0 ' +
          ('' + (this.placement_.width)) + ' ' +
          ('' + (this.placement_.height)),
        width: this.placement_.width * this.zoom,
        height: this.placement_.height * this.zoom
      });
      this.graph.roots.forEach(node => {
        this.renderBoxes(g, node);
      });
      this.graph.roots.forEach(node => {
        this.renderArrows(g, node);
      });
    },
    function renderBoxes(g, node, parent) {
      var self = this;
      var coords = this.placement_.getPlacement(node);
      if ( coords == null ) {
        throw new Error(
          `DAGView can't get a placement for this node; is it in the graph?`);
        return;
      }

      g
        .callIf(! self.alreadyRendered_[node.id], function () {
          self.alreadyRendered_[node.id] = true;
          this
            .tag(self.nodeView, {
              data: node.data,
              position: coords,
              size: Array(coords.length).fill(self.cellSize)
            })
        })
        // .callIf(parent, function () {
        //   var pcoords = self.placement_.getPlacement(parent);
        //   this
        //     .tag(self.VHVArrowLine, {
        //       startPos: [
        //         // TODO: cell lanes
        //         pcoords[0] + 0.5*self.cellSize,
        //         pcoords[1] + self.cellSize,
        //       ],
        //       endPos: [
        //         // TODO: cell lanes
        //         coords[0] + 0.5*self.cellSize,
        //         coords[1],
        //       ]
        //     })
        //     .tag(self.SimpleArrowHead, {
        //       originPos: [
        //         // TODO: cell lanes
        //         coords[0] + 0.5*self.cellSize,
        //         coords[1],
        //       ],
        //       angle: 0,
        //       size: 5
        //     })
        // })
        ;

      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.renderBoxes(g, childNode, node);
      })
    },
    function renderArrows(g, node, parent) {
      if ( parent ) {
        let arrows = this.arrows_[parent.id][node.id];
        let parentPixelCoords = this.placement_.getPlacement(parent);
        let nodePixelCoords = this.placement_.getPlacement(node);

        let cellLanePixels = this.cellSize * 0.5;

        let enterCell, exitCell;
        (() => {
          // These variables are in a closure to prevent use after this
          let parentGridCoords = this.gridPlacement.getPlacement(parent);
          let nodeGridCoords = this.gridPlacement.getPlacement(node);
          enterCell = nodeGridCoords;
          exitCell = [parentGridCoords[0], parentGridCoords[1] + 1];
        })();

        for ( let arrow of arrows ) {
          let anchors = [];
          let enterCellLane = this.cellSize * this.cellLaneRatio_(arrow.enterCellLane);
          let exitCellLane = this.cellSize * this.cellLaneRatio_(arrow.exitCellLane);

          // Start first row after exiting the node
          if ( arrow.hasOwnProperty('topRowLane') ) {
            anchors.push([
              parentPixelCoords[0] + exitCellLane,
              this.placement_.getRowLanePosition(exitCell[1], arrow.topRowLane)
            ]);
          }

          if ( arrow.hasOwnProperty('columnLane') ) {
            // Start column from the row connecting to the parent
            anchors.push([
              this.placement_.getColLanePosition(enterCell[0], arrow.columnLane),
              this.placement_.getRowLanePosition(exitCell[1], arrow.topRowLane)
            ]);

            // Start second row from the column
            anchors.push([
              this.placement_.getColLanePosition(enterCell[0], arrow.columnLane),
              this.placement_.getRowLanePosition(enterCell[1], arrow.bottomRowLane)
            ]);
          }

          // Penultimate line meets line connecting to enterCell
          var lane = arrow.hasOwnProperty('bottomRowLane')
            ? arrow.bottomRowLane : arrow.topRowLane ;
          anchors.push([
            nodePixelCoords[0] + enterCellLane,
            this.placement_.getRowLanePosition(enterCell[1], lane)
          ])

          // TODO: calculate cell lane factor
          g.tag(this.SegmentedArrowLine, {
            startPos: [
              parentPixelCoords[0] + exitCellLane,
              parentPixelCoords[1] + this.cellSize,
            ],
            endPos: [
              nodePixelCoords[0] + enterCellLane,
              nodePixelCoords[1],
            ],
            anchors: anchors,
            testing: {
              node: node,
              parent: parent,
              arrow: arrow
            }
          });
          g.tag(this.SimpleArrowHead, {
            originPos: [
              nodePixelCoords[0] + enterCellLane,
              nodePixelCoords[1],
            ],
            angle: 0,
            size: 5
          })
        }
      }
      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.renderArrows(g, childNode, node);
      })
    },
    function generateArrows(node, parent) {
      if ( parent ) {
        // Ensure list of arrows exists
        if ( ! this.arrows_[parent.id] )
          this.arrows_[parent.id] = {};
        if ( ! this.arrows_[parent.id][node.id] )
          this.arrows_[parent.id][node.id] = [];

        let parentCoords = this.gridPlacement.getPlacement(parent);
        let nodeCoords = this.gridPlacement.getPlacement(node);

        let hasDX = parentCoords[0] - nodeCoords[0] != 0;
        let hasDY = parentCoords[1] - nodeCoords[1] != -1;
        let enterCell = nodeCoords;
        let exitCell = [parentCoords[0], parentCoords[1] + 1];

        let arrow = this.ArrowPlan.create({
          // Swap these to enable arrowhead sharing
          // enterCellLane: 0,
          enterCellLane: this.getCellLane(enterCell, Math.random()/*parent.id*/),
          enterCellLane: this.getCellLane(enterCell, parent.id),
          exitCellLane: this.getCellLane(exitCell, parent.id)
        });

        if ( hasDX || hasDY ) {
          let row = exitCell[1];
          arrow.topRowLane = this.getLane(this.rowLanes_, row, node.id, parent.id);
        }

        if ( hasDY ) {
          let row = enterCell[1];
          arrow.bottomRowLane = this.getLane(this.rowLanes_, row, node.id, parent.id);
          let col = enterCell[0];
          // Swap these to disable column sharing
          // arrow.columnLane = this.getLane(this.colLanes_, col, parent.id);
          arrow.columnLane = this.getLane(this.colLanes_, col, node.id, parent.id);
        }

        this.arrows_[parent.id][node.id].push(arrow);
      }
      this.graph.getDirectChildren(node.id).forEach(childNode => {
        this.generateArrows(childNode, node);
      })
    },
    function getCellLane(cell, id) {
      return this.getLane(this.cellLanes_, this.hash_(...cell), id);
    },
    function getLane(laneMap, index, toNode, fromNode) {
      var lanes = laneMap[index] || {};
      for ( let k in lanes ) {
        if ( lanes[k] == toNode ) return k;
        if ( fromNode && lanes[k] == fromNode ) return k;
        if ( fromNode && lanes[k].includes(':') ) {
          var parts = lanes[k].split(':');
          if ( parts[0] == toNode ) {
            lanes[k] = toNode;
            return k;
          }
          if ( parts[1] == fromNode ) {
            lanes[k] = fromNode;
            return k;
          }
        }
      }
      var lane = Object.keys(lanes).length;
      laneMap[index] = { ...lanes, [lane]: fromNode ? `${toNode}:${fromNode}` : toNode };
      return lane;
    },
    function hash_(x, y) {
      return (x + y) * (x + y + 1) / 2 + x;
    },
    function cellLaneRatio_(lane) {
      // f0 produces the series: [1 2 2 4 4 4 4....] as v increases from 0.
      //  Multiplying the output of f0 by 2 gives the denominator
      let f0 = v => Math.pow(2, Math.floor(Math.log2(v+1)));

      // f1 produces the series: [1 1 3 1 3 5 7....] as v increases from 0.
      // ???: If this has a formal name please let me know
      let f1 = v => (v - f0(v) + 2) * 2 - 1;

      return f1(lane) / (2*f0(lane));
    }
  ]
});
