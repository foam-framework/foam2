foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ListCreateController'
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
        summaryView: this.TicketTableView,
        createLabel:'New Ticket',
        showActions: true
      })
    }
  ],

  classes: [
    {
      name: 'TicketTableView',
      extends: 'foam.u2.View',

      requires: [
        'foam.u2.TableView',
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

