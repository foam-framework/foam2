/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
*     http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterNode',

  documentation: 'The class represents an instance in the cloud',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'group'
    },
    {
      class: 'String',
      name: 'ip'
    },
    {
      class: 'String',
      name: 'hostName'
    },
    {
      class: 'Int',
      name: 'servicePort'
    },
    {
      class: 'Int',
      name: 'socketPort'
    },
    {
      class: 'String',
      name: 'electionIP'
    },
    {
      class: 'Int',
      name: 'electionPort'
    },
    {
      class: 'Boolean',
      name: 'isVoter'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.mrac.ClusterNodeType',
      name: 'type'
    }
  ]
});
