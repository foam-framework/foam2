/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.mrac',
  name: 'MNService',

  methods: [
    {
      name: 'replayAll',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ]
    },
    {
      name: 'sinkDAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'daoKey',
          type: 'String'
        }
      ]
    }
  ]
})
