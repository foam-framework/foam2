/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graph.map2d',
  name: 'RelationshipGridPlacementStrategy',
  documentation: `
    A GridPlacementStrategy that positions FObjects based on their relationship
    in a provided Graph.
  `,

  requires: [
    'foam.u2.svg.map2d.PredeterminedGridPlacementPlan'
  ],

  properties: [
    {
      name: 'rootObject',
      class: 'FObjectProperty'
    },
    {
      name: 'relationshipPropertyName',
      class: 'String'
    },
    {
      name: 'graph',
      class: 'FObjectProperty',
      of: 'foam.graph.Graph'
    }
  ],

  methods: [
    {
      name: 'getPlan',
      code: function getPlan() {
        var columns = [];
        var intermediatePlan = {};
        var alreadyAdded = {};

        let addCol = index => {
          var col = { position: index };
          if ( index >= columns.length ) {
            columns.push(col)
            return col;
          }
          columns.splice(index, 0, col);
          for ( let i = index + 1 ; i < columns.length ; i++ ) {
            col.position++;
          }
          return col;
        }

        let addingQueue = [];

        let add;
        add = (obj, row, col, pushCols) => {
          console.log('ADD ' + obj.id);
          var entry = null;
          if ( alreadyAdded[obj.id] ) {
            entry = intermediatePlan[obj.id];
            if ( entry.row.position < row ) {
              entry.row.position = row;
            }
            // return Promise.resolve();
          } else {
            alreadyAdded[obj.id] = true;

            // plan.addAssociation(obj, [0, 0]);
            entry = {
              row: { position: row },
              col: pushCols ? addCol(col) : columns[col],
              obj: obj,
            };
            intermediatePlan[entry.obj.id] = entry;
          }

          childNodes = this.graph.getDirectChildren(obj.id, true);
          childNodes.map(o => o.data).forEach((o, i) => {
            console.log('adding ' + o.id + ' to queue');
            addingQueue.push({
              parent: entry,
              obj: o,
              index: i
            });
          });
          return Promise.resolve();
        };
        let maybeAddMore
        maybeAddMore = () => {
          if ( addingQueue.length < 1 ) return;
          let next = addingQueue.shift();
          return add(
            next.obj,
            next.parent.row.position + 1,
            next.parent.col.position + next.index,
            next.index != 0
          ).then(maybeAddMore);
        };
        return add(this.graph.roots[0], 0, 0, true).then(maybeAddMore).then(() => {
          var plan = this.PredeterminedGridPlacementPlan.create({
            shape: [0, 0]
          });

          Object.values(intermediatePlan).forEach(entry => {
            plan.addAssociation_(entry.obj.id, [
              entry.col.position, entry.row.position,
            ])
          });

          return plan;
        });
      }
    }
  ],
});
