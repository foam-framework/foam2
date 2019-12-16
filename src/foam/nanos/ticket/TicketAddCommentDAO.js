foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketAddCommentDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Add the Ticket 'comment' to the TicketCommentDAO`,

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    Ticket ticket = (Ticket) obj;
    String comment = ticket.getComment();
    ticket = (Ticket) getDelegate().put_(x, obj);
    if ( ! SafetyUtil.isEmpty(comment) ) {
      TicketComment tc = new TicketComment.Builder(x)
        .setComment(comment)
        .setTicket(ticket.getId())
        .build();
      ((DAO) x.get("ticketCommentDAO")).put_(x, tc);
      ticket = (Ticket) ticket.fclone();
      ticket.setComment("");
    }
    return ticket;
      `
    }
  ]
});
