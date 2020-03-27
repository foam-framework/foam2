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
      name: 'setConfigId',
      args: [
        {
          name: 'id',
          type: 'String'
        }
      ]
    },
    {
      name: 'getConfigId',
      type: 'String'
    },
    {
      name: 'setPrimaryConfigId',
      args: [
        {
          name: 'id',
          type: 'String'
        }
      ]
    },
    {
      name: 'getPrimaryConfigId',
      type: 'String'
    },
    {
      name: 'getConfig',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
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
      name: 'getVoters',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaType: `java.util.List`,
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
    },
    {
      name: 'getNodesForConsensus',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Integer',
    },
    {
      name: 'addConnection',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ]
    },
    {
      name: 'removeConnection',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'name',
          type: 'String'
        }
      ]
    },
    {
      documentation: 'Are at least half+1 of the expected instances online?',
      name: 'hasQuorum',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'Boolean',
    },
    {
      name: 'buildURL',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        },
        {
          name: 'config',
          type: 'foam.nanos.medusa.ClusterConfig'
        },
      ],
    },
    {
      name: 'getClientDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'serviceName',
          type: 'String'
        },
        {
          name: 'sendClusterConfig',
          type: 'ClusterConfig'
        },
        {
          name: 'recieveClusterConfig',
          type: 'ClusterConfig'
        }
      ]
    },
    {
      name: 'getMaxRetryAttempts',
      type: 'Integer'
    },
    {
      name: 'getMaxRetryDelay',
      type: 'Integer'
    }
  ]
});
