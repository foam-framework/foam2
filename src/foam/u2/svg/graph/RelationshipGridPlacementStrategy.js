foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'RelationshipGridPlacementStrategy',
  documentation: `
    A GridPlacementStrategy that positions FObjects by a
    predetermined plan based on a specified relationship.

    This plan requires a relationship property name and a
    root node. The plan fails if there is no path via this
    key to the 
  `,

  requires: [
    'foam.u2.svg.graph.PredeterminedGridPlacementPlan'
  ],

  properties: [
    {
      name: 'rootObject',
      class: 'FObjectProperty'
    },
    {
      name: 'relationshipPropertyName',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getPlan',
      code: function getPlan() {
        var columns = [];
        var intermediatePlan = [];

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

        let add;
        add = (obj, row, col) => {
          // plan.addAssociation(obj, [0, 0]);
          intermediatePlan.push({
            row: { position: row },
            col: addCol(col),
            obj: obj,
          });
          return obj[this.relationshipPropertyName].dao
            .select().then(r => Promise.all(r.array.map((o, i) =>
              add(o, row + 1, col + i))));
        };
        return add(this.rootObject, 0, 0).then(() => {
          var plan = this.PredeterminedGridPlacementPlan.create({
            shape: [0, 0]
          });

          intermediatePlan.forEach(entry => {
            plan.addAssociation_(entry.obj.id, [
              entry.row.position, entry.col.position,
            ])
          });

          return plan;
        });
      }
    }
  ],
});