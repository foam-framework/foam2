/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.mrac',
  name: 'ClusterConfigService',
  methods: [
    {
      name: 'getIsPrimary',
      type: 'Boolean'
    },
    {
      name: 'getConfig',
      type: 'foam.nanos.mrac.ClusterConfig',
    },
    {
      name: 'getPrimaryConfig',
      type: 'foam.nanos.mrac.ClusterConfig',
    },
    {
      name: 'getPrimaryDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
    },
    {
      name: 'onDAOUpdate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
