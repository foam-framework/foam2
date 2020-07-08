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
        var plan = this.PredeterminedGridPlacementPlan.create({
          shape: [0, 0]
        });

        let add;
        add = obj => {
          // plan.addAssociation(obj, [0, 0]);
          return obj[this.relationshipPropertyName].dao
            .select().then(r => {
              // TODO: write the hard part
            })
        };
        return add(this.rootObject);
      }
    }
  ],
});