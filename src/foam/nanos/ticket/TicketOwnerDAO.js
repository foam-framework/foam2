foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketOwnerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Set the ticket's owner`,

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    Ticket ticket = (Ticket) obj;
    if ( ticket.getOwner() == 0 ) {
      User user = (User) x.get("user");
      User agent = (User) x.get("agent");
      ticket.setOwner(agent != null ? agent.getId() : user.getId());
    }
    ticket = (Ticket) getDelegate().put_(x, ticket);
    return ticket;
      `
    }
  ]
});
