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
      documentation: 'Instance supplying replay details',
      name: 'responder',
      class: 'String',
    },
    {
      name: 'maxIndex',
      class: 'Long'
    }
  ]
});
