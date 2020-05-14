/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketOwnerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Set the ticket's owner`,

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    Ticket ticket = (Ticket) obj;
    if ( ticket.getOwner() == 0 ) {
      Subject subject = (Subject) x.get("subject");
      User user = subject.getRealUser();
      ticket.setOwner(user.getId());
    }
    ticket = (Ticket) getDelegate().put_(x, ticket);
    return ticket;
      `
    }
  ]
});
