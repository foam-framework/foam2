/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'NodeStatus',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'hostName'
    },
    {
      class: 'Long',
      name: 'group'
    },
    {
      class: 'Boolean',
      name: 'online'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.medusa.MedusaType',
      name: 'InstanceType'
    },
    {
      class: 'Boolean',
      name: 'isMasterSlave'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.medusa.quorum.InstanceState',
      name: 'quorumStatus'
    }
  ]
});
