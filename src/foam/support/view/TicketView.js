foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ListCreateController',
    'foam.support.view.TicketDetailView',
    'foam.support.view.CreateTicketView'
  ],

  imports: [ 'ticketDAO' ,'createLabel'],

  exports: [ 'hideSummary' ],

  css:`
  ^ {
    width: 992px;
    margin: auto;
  }
  ^ .foam-u2-UnstyledActionView-create {
    float: right;
    width: 135px;
    height: 40px;
    color: white;
    background-color: #59a5d5;
    border: none;
    margin: 0 20px 20px;
  }
  ^ .foam-support-view-SummaryCard{
    width: 164px;
  }
  ^ .foam-u2-view-TableView-row:hover {
    cursor: pointer;
    background: %TABLEHOVERCOLOR%;
  }
  ^ .foam-u2-view-TableView-row {
    height: 40px;
  }
  ^ .button-div{
    height: 40px;
  }
  ^ .foam-u2-view-TableView td{
    width: 8px;
  }
  ^ .foam-u2-view-TableView-th-editColumns{
    width: 10px;
  }
  ^ .foam-u2-view-TableView-th-id{
    width: 125px;
  }
  ^ .foam-u2-view-TableView-th-requestorEmail{
    width: 200px;
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hideSummary',
      value: false
    }
  ],

  methods: [
    function initE(){

      this.addClass(this.myClass())
      .start().hide(this.hideSummary$)
        .tag({ class: 'foam.support.view.TicketSummaryView' })
      .end()
      .tag({
        class: 'foam.u2.ListCreateController',
        dao: this.ticketDAO,
        detailView: this.TicketDetailView,
        summaryView: this.TicketTableView.create(),
        createDetailView: this.CreateTicketView,
        createLabel:'New Ticket',
        showActions: false
      })
    }
  ],
  
  classes: [
    {
      name: 'TicketTableView',
      extends: 'foam.u2.View',

      requires: [
        'foam.u2.view.ScrollableTableView',
        'foam.support.model.Ticket',
      ],
      
      imports: [ 'ticketDAO'],

      properties: [
        'selection'
      ],

      methods: [
        function initE() {
          this
            .start({
              selection$: this.selection$,
              class: 'foam.u2.view.ScrollTableView',
              data: this.ticketDAO,
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});

