/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
*     http://www.apache.org/licenses/LICENSE-2.0
*/

foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'MedusaType',

  documentation: 'Distinguish between Medusa functionality.',

  values: [
    {
      name: 'MEDIATOR',
      label: 'Mediator'
    },
    {
      name: 'NODE',
      label: 'Node'
    }
  ]
});
