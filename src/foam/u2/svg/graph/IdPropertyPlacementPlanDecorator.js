foam.CLASS({
  package: 'foam.u2.svg.graph',
  name: 'IdPropertyPlacementPlanDecorator',
  implements: ['foam.u2.svg.graph.GridPlacementPlan'],

  documentation: `
    For more flexibility in how object placement is determined,
    the TreeGraph (SVG) view provides the entire object to the
    placement plan.

    Placement plans that determine placement using only the
    object's ID can be decorated with this model to be used in
    a TreeGraph view.
  `,

  properties: [
    {
      name: 'delegate',
      class: 'FObjectProperty',
      of: 'FObject'
    },
    {
      name: 'targetProperty',
      class: 'String'
    },
    {
      name: 'shape',
      getter: function () {
        return this.delegate.shape;
      }
    }
  ],

  methods: [
    function getPlacement(obj) {
      return this.delegate.getPlacement(obj[this.targetProperty]);
    }
  ],
});