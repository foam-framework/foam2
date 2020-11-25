/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
  // REVIEW: unable to get owner to display in any section on Ticket.
  targetProperty: {
    visibility: 'RO',
    section: 'infoSection',
    tableCellFormatter: function(value) {
      this.add(this.__subSubContext__.userDAO.find(value)
        .then((user) => user && user.legalName ? user.legalName : value));
    }
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
    visibiltiy: 'RO',
    section: 'infoSection'
  },
  // REVIEW: placing comments in section breaks accessing the detail
  // view of the comment. While not placing them in section
  // puts them in section 'uncatagorized'.
  // sourceProperty: {
  //   visibility: 'RO',
  //   section: 'commentSection'
  // }
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
  targetProperty: {
    visibiltiy: 'RO',
    section: 'metaSection'
  },
  sourceProperty: {
    visibility: 'HIDDEN'
  }
});
