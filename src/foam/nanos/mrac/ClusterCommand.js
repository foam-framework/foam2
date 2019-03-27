/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.mrac',
  name: 'ClusterCommand',

  documentation: ``,
  constants: [
    {
      name: 'PUT',
      type: 'String',
      value: 'put'
    },
    {
      name: 'REMOVE',
      type: 'String',
      value: 'remove'
    },
    {
      name: 'CMD',
      type: 'String',
      value: 'cmd'
    }
  ],

  properties: [
    {
      name: 'command',
      class: 'String'
    },
    {
      name: 'obj',
      class: 'FObjectProperty'
    }
  ]
});
