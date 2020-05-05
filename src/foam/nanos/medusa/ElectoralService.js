/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'ElectoralService',

  methods: [
    {
      name: 'getState',
      type: 'foam.nanos.medusa.ElectoralServiceState',
      async: true,
    },
    {
      name: 'dissolve',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'vote',
      type: 'Long',
      async: true,
      args: [
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'time',
          type: 'Long'
        }
      ]
    },
    {
      name: 'report',
      async: true,
      args: [
        {
          name: 'winner',
          type: 'String'
        }
      ]
    }
  ]
});
