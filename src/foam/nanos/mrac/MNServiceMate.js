/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'MNServiceMate',

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Long',
      name: 'maxIndex'
    },
    {
      class: 'Long',
      name: 'minIndex'
    }
  ]
})
