/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketSummaryView',
  extends: 'foam.u2.View',

  documentation: 'Top-level ticket summary view.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.support.model.Ticket',
    'foam.support.view.SummaryCard',
    'foam.support.view.TicketView',
  ],

  imports: [
    'user'
  ],

  exports: [ 'as data' ],
 
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
    { name: 'newLabel',     message: 'New'     },
    { name: 'updatedLabel', message: 'Updated' },
    { name: 'openLabel',    message: 'Open'    },
    { name: 'pendingLabel', message: 'Pending' },
    { name: 'solvedLabel',  message: 'Solved'  }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.user.tickets; }
    },
    {
      class: 'Int',
      name: 'newCount'
    },
    {
      class: 'Int',
      name: 'updatedCount'
    },
    {
      class: 'Int',
      name: 'openCount'
    },
    {
      class: 'Int',
      name: 'pendingCount'
    },
    {
      class: 'Int',
      name: 'solvedCount'
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
          count$: this.newCount$,
          status: this.newLabel
        })
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.updatedCount$,
          status: this.updatedLabel
        })
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.openCount$,
          status: this.openLabel
        })
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.pendingCount$,
          status: this.pendingLabel
        })
      .end()
      .start('span')
        .tag(this.SummaryCard, {
          count: this.solvedCount$,
          status: this.solvedLabel
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
        var newDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "New"));
        newDAO.select(this.COUNT()).then(function(count) {
          self.newCount = count.value;
        });
        var updatedDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "Updated"));
        updatedDAO.select(this.COUNT()).then(function(count) {
          self.updatedCount = count.value;
        });
        var openDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "Open"));
        openDAO.select(this.COUNT()).then(function(count) {
          self.openCount = count.value;
        });
        var pendingDAO = this.dao.where(this.EQ(this.Ticket.STATUS, 'Pending'));
        pendingDAO.select(this.COUNT()).then(function(count) {
          self.pendingCount = count.value;
        });
        var solvedDAO = this.dao.where(this.EQ(this.Ticket.STATUS, 'Solved'));
        solvedDAO.select(this.COUNT()).then(function(count) {
          self.solvedCount = count.value;
        });
        this.dao.select(this.COUNT()).then(function(count) {
          self.ticketCount = count.value;
        });
      }
    }
  ]
});
