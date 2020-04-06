/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayDetailsCmd',

  properties: [
    {
      documentation: 'Instance requesting replay details',
      name: 'requester',
      class: 'String',
    },
    {
      documentation: 'Instance supplying replay details',
      name: 'responder',
      class: 'String',
    },
    {
      name: 'minIndex',
      class: 'Long'
    },
    {
      name: 'maxIndex',
      class: 'Long'
    },
    {
      name: 'count',
      class: 'Long'
    }
  ]
});
