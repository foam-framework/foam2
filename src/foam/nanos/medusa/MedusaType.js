/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
*     http://www.apache.org/licenses/LICENSE-2.0
*/

foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'MedusaType',
  // todo: rename to InstanceType

  documentation: 'Distinguish between Medusa functionality.',

  values: [
    {
      name: 'MEDIATOR',
      label: 'Mediator'
    },
    {
      name: 'NODE',
      label: 'Node'
    },
    {
      name: 'NERF',
      label: 'NERF'
    },
    {
      name: 'ARCHIVE',
      label: 'Archive'
    }
  ]
});
