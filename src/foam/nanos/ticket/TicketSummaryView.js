/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketSummaryView',
  extends: 'foam.u2.View',

  documentation: 'Top-level ticket summary view.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.ticket.Ticket',
    'foam.nanos.ticket.TicketStatus',
    'foam.nanos.ticket.SummaryCard',
    'foam.nanos.ticket.TicketView',
  ],

  imports: [
    'user'
  ],

  exports: [
    'as data'
  ],
 
  css: `
    ^ {
      margin-bottom: 20px;
    }
    ^:hover{
      cursor: pointer;
    }
  `,

  messages: [
    { name: 'title',        message: 'Tickets' },
    { name: 'openLabel',    message: 'Open'    },
    { name: 'closedLabel',  message: 'Closed'  }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() {
        return this.user.tickets;
      }
    },
    {
      class: 'Int',
      name: 'openCount'
    },
    {
      class: 'Int',
      name: 'closedCount'
    },
    {
      class: 'Int',
      name: 'ticketCount'
    }
  ],

  methods: [
    function initE() {
    this.dao.on.sub(this.onDAOUpdate);
    this.onDAOUpdate();

    this
      .addClass(this.myClass())
      .start().addClass('blue-card-title')
        .add(this.title)
        .start()
          .addClass('thin-align')
          .add(this.ticketCount$)
        .end()
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.openCount$,
          status: this.openLabel
        })
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.closedCount$,
          status: this.closedLabel
        })
      .end();
    },
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        var openDAO = this.dao.where(this.EQ(this.Ticket.STATUS, this.TicketStatus.OPEN));
        openDAO.select(this.COUNT()).then(function(count) {
          self.openCount = count.value;
        });
        var closedDAO = this.dao.where(this.EQ(this.Ticket.STATUS, this.TicketStatus.CLOSED));
        closedDAO.select(this.COUNT()).then(function(count) {
          self.closedCount = count.value;
        });
        this.dao.select(this.COUNT()).then(function(count) {
          self.ticketCount = count.value;
        });
      }
    }
  ]
});
