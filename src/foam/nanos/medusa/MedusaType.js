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
      label: 'Mediator',
      ordinal: 0
    },
    {
      name: 'NODE',
      label: 'Node',
      ordinal: 1
    },
    {
      name: 'NERF',
      label: 'NERF',
      ordinal: 2
    },
    {
      name: 'ARCHIVE',
      label: 'Archive',
      ordinal: 3
    },
    {
      name: 'OTHER',
      label: 'Other',
      ordinal: 4
    }
  ]
});
