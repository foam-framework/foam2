foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.ticket.Ticket',
  forwardName: 'tickets',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'ticketDAO',
  unauthorizedTargetDAOKey: 'localTicketDAO',
  targetProperty: {
    visibility: 'RO',
    section: 'details',
    tableCellFormatter: function(value) {
      this.add(this.__subSubContext__.userDAO.find(value)
        .then((user) => user && user.legalName ? user.legalName : value));
    }
  },
  sourceProperty: {
    section: 'administrative'
  }
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.ticket.Ticket',
  targetModel: 'foam.nanos.ticket.TicketComment',
  forwardName: 'comments',
  inverseName: 'ticket',
  cardinality: '1:*',
  sourceDAOKey: 'ticketDAO',
  unauthorizedSourceDAOKey: 'localTicketDAO',
  targetDAOKey: 'ticketCommentDAO',
  unauthorizedTargetDAOKey: 'localTicketCommentDAO',
  targetProperty: {
    section: 'comments',
    order: 2
  },
});

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.ticket.TicketComment',
  forwardName: 'ticketComments',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceDAOKey: 'userDAO',
  unauthorizedSourceDAOKey: 'localUserDAO',
  targetDAOKey: 'ticketCommentDAO',
  unauthorizedTargetDAOKey: 'localTicketCommentDAO',
  sourceProperty: {
    section: 'basicInfo',
    visibility: 'RO'
  },
  targetProperty: {
    hidden: true
  }
});
