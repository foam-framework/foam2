/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'SudoTicket',
  extends: 'foam.nanos.ticket.Ticket',

  properties: [
    {
      name: 'user',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      section: 'comment'
    }
  ],
});
