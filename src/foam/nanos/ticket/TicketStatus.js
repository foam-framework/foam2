/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketStatus',

  properties: [
    {
      name: 'id',
      class: 'String',
      label: 'Status'
    },
    {
      name: 'label',
      class: 'String'
    },
    {
      name: 'ordinal',
      class: 'Long'
    },
    {
      name: 'description',
      class: 'String'
    }
  ]
});
