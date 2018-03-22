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

  css:`
  ^ {
    width: 992px;
    margin: auto;
  }
  ^ .foam-u2-view-TableView-foam-support-model-Ticket {
    margin-top:30px;
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
  `,

  methods: [
    function initE(){
      this.addClass(this.myClass())
      .tag({
        class: 'foam.u2.ListCreateController',
        dao: this.ticketDAO,
        detailView: this.TicketDetailView,
        summaryView: this.TicketTableView,
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

      exports: [ 'selection' ],

      properties: [
        'selection'
      ],

      methods: [
        function initE() {
          this
            .start({
              selection: this.selection$,
              class: 'foam.u2.view.TableView',
              data: this.ticketDAO,
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ]
});

