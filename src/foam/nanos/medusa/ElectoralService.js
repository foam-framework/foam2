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
      documentation: `Inform the Electoral Service that a Mediator can vote. A mediator changing status cannot adjust the ElectorService state. This method allows the Electoral Service to change it's state to IN_SESSION if cluster already has Mediator quorum when this mediator came ONLINE.`,
      name: 'register',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          documentation: 'ClusterConfig Id',
          name: 'id',
          type: 'String'
        }
      ]
    },
    {
      name: 'getState',
      type: 'foam.nanos.medusa.ElectoralServiceState',
      async: true,
    },
    {
      documentation: 'Force an election, if one not already in progress.',
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
      documentation: 'Called by the party runing the election, requesting us to vote. A vote is simply a random number. Highest number wins. The caller also sends when they started the election. If we are also in ELECTION state, but the other party started earlier then we abandon our election.',
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
