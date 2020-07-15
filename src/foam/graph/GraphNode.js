/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graph',
  name: 'GraphNode',

  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: `
        Graph node ID may differ from data's ID. For example,
        a userCapabilityJunction will go inside a GraphNode with
        the Capability's id.
      `,
      expression: function(data) {
        return data.id;
      }
    },
    {
      name: 'forwardLinks',
      class: 'StringArray'
    },
    {
      name: 'inverseLinks',
      class: 'StringArray'
    },
    {
      name: 'data',
      of: 'foam.core.FObject',
    }
  ]
});
