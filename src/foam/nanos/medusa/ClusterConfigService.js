/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigService',

  documentation: `Service from which an instance may inquire it\'s
cluster type - such as primary. It also provides access to
configuration for contacting the primary node.`,

  methods: [
    {
      name: 'getIsPrimary',
      type: 'Boolean'
    },
    {
      name: 'setIsPrimary',
      args: [
        {
          name: 'primary',
          type: 'Boolean'
        },
      ]
    },
    {
      name: 'setConfig',
      args: [
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig',
        }
      ]
    },
    {
      name: 'getConfig',
      type: 'foam.nanos.medusa.ClusterConfig',
    },
    {
      name: 'setPrimaryConfig',
      args: [
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig',
        }
      ]
    },
    {
      name: 'getPrimaryConfig',
      type: 'foam.nanos.medusa.ClusterConfig',
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
    },
    {
      name: 'getVoterPredicate',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'canVote',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig'
        }
      ]
    }
  ]
});
