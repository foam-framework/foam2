foam.CLASS({
  package: 'foam.support.view',
  name: 'SummaryTicketView',
  extends: 'foam.u2.View',
  documentation: 'Top-level ticket summary view.',
  implements: [
    'foam.mlang.Expressions'
  ],
  requires: [
    'foam.support.model.Ticket'
  ],
  imports: [
    'user'
  ],
  exports: [ 'as data' ],
  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          margin-bottom: 20px;
        }
      */}
    })
  ],
  messages: [
    { name: 'title',          message: 'Tickets' },
    { name: 'newLabel',      message: 'New' },
    { name: 'updateLabel',       message: 'Updated' },
    { name: 'openLabel',       message: 'Open' },
    { name: 'pendingLabel', message: 'Pending' },
    { name: 'solvedLabel',      message: 'Solved' }
  ],
  properties: [
    {
      name: 'dao',
      factory: function() { return this.ticketDAO; }
    },
    {
      class: 'Int',
      name: 'newCount',
      value: "..."
    },
    {
      class: 'Int',
      name: 'updatedCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'openCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'pendingCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'solvedCount',
      value: '...'
    },
    {
      class: 'Int',
      name: 'ticketCount',
      value: '...'
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
          .start().addClass('thin-align').add(this.ticketCount$).end()
        .end()
        .tag({ class: 'foam.support.view.SummaryCard', count$: this.newCount$, status: this.newLabel })
        .tag({ class: 'foam.support.view.SummaryCard', count$: this.updatedCount$, status: this.updatedLabel })
        .tag({ class: 'foam.support.view.SummaryCard', count$: this.openCount$, status: this.openLabel })
        .tag({ class: 'foam.support.view.SummaryCard', count$: this.pendingCount$, status: this.pendingLabel })
        .tag({ class: 'foam.support.view.SummaryCard', count$: this.solvedCount$, status: this.solvedLabel })
    },
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;
        //Grab new tickets
        var newDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "New"));
        newDAO.select(this.COUNT()).then(function(count) {
          self.newCount = count.value;
        });
        //Grab updated tickets
        var updatedDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "Updated"));
        updatedDAO.select(this.COUNT()).then(function(count) {
          self.updatedCount = count.value;
        });
        //Grab open tickets
        var openDAO = this.dao.where(this.EQ(this.Ticket.STATUS, "Open"));
        openDAO.select(this.COUNT()).then(function(count) {
          self.openCount = count.value;
        });
        //Grab pending tickets
        var pendingDAO = this.dao.where(this.EQ(this.Ticket.STATUS, 'Pending'));
        pendingDAO.select(this.COUNT()).then(function(count) {
          self.pendingCount = count.value;
        });
        //Grab solved tickets
        var solvedDAO = this.dao.where(this.EQ(this.Ticket.STATUS, 'Solved'));
        solvedDAO.select(this.COUNT()).then(function(count) {
          self.solvedCount = count.value;
        });
      }
    }
  ]
});