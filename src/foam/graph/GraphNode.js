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
