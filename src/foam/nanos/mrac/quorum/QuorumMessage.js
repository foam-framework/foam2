/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.mrac.quorum',
  name: 'QuorumMessage',
  documentation: 'This model is a super class of all types of request message in quorum.',
  
  properties: [
    {
      class: 'Enum',
      of: 'foam.nanos.mrac.quorum.QuorumMessageType',
      name: 'messageType'
    },
    {
      class: 'Long',
      name: 'destinationInstance'
    },
    {
      class: 'Long',
      name: 'sourceInstance'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.mrac.quorum.Vote',
      name: 'vote'
    },
    {
      class: 'String',
      name: 'sourceElectionIP'
    },
    {
      class: 'Int',
      name: 'sourceElectionPort'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.mrac.quorum.InstanceState',
      name: 'sourceStatus'
    }
  ]
  
});