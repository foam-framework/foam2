/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.mrac',
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
      of: 'foam.nanos.mrac.ClusterNodeType',
      name: 'InstanceType'
    },
    {
      class: 'Boolean',
      name: 'isMasterSlave'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.mrac.quorum.InstanceState',
      name: 'quorumStatus'
    }
  ]
});
