/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.medusa.quorum',
  name: 'QuorumMessage',
  documentation: 'This model is a super class of all types of request message in quorum.',
  
  properties: [
    {
      class: 'Enum',
      of: 'foam.nanos.medusa.quorum.QuorumMessageType',
      name: 'messageType'
    },
    {
      class: 'String',
      name: 'destinationInstance'
    },
    {
      class: 'String',
      name: 'sourceInstance'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.medusa.quorum.Vote',
      name: 'vote'
    },
    {
      class: 'Int',
      name: 'sourceElectionPort'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.medusa.quorum.InstanceState',
      name: 'sourceStatus'
    }
  ]
});
