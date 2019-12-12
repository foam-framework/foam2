/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.mrac.quorum',
  name: 'ElectionPropose',
  extends: 'foam.nanos.mrac.quorum.QuorumMessage',
  documentation: 'This model used to propose a new Primary in a cloud.',
  
  properties: [
    {
      class: 'Long',
      name: 'proposedPrimary'
    },
    {
      class: 'Long',
      name: 'electionEra'
    },
    {
      class: 'Long',
      name: 'targetId'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.mrac.quorum.InstanceState',
      name: 'sourceStatus'
    }
  ]
  
});