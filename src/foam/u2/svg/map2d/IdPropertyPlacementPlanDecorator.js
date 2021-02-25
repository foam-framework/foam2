/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.svg.map2d',
  name: 'IdPropertyPlacementPlanDecorator',
  implements: ['foam.u2.svg.map2d.GridPlacementPlan'],

  documentation: `
    Provides only the value of the specified property to the underlying grid
    placement plan.
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
