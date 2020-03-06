/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.ENUM({
  package: 'foam.nanos.medusa.quorum',
  name: 'InstanceState',

  values: [
    'PRIMARY',
    'SECONDARY',
    'ELECTING',
    'NONE'
  ]
})
