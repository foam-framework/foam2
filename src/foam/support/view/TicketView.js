foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ListCreateController',
    'foam.support.view.TicketTableView'
  ],

  imports: [ 'ticketDAO' ,'createLabel'],

  css:`
  ^ .foam-u2-view-TableView-foam-support-model-Ticket
  {
    margin-top:30px;
  } 
  ^ .foam-u2-UnstyledActionView-create
  {
    width: 135px;
    height: 40px;
    background-color: #59a5d5;
    margin-top: 70px;
    margin-right: 150px;
    position:absolute;
    top:0;
    right:0;
  }
  ^ #v36
  {
    width: 56px;
    height: 40px;
    font-family: Roboto;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 2.86;
    letter-spacing: 0.2px;
    text-align: center;
    color: #ffffff;
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
  ]
})

foam.CLASS({
  package:'foam.support.view',
  name: 'TicketTableView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.TableView',
    'foam.support.model.Ticket',
  ],

  exports: [ 'as data' ],

  imports: [ 'ticketDAO'],

  methods: [
    function initE() {
      this
        .start({
          selection: this.selection$,
          class: 'foam.u2.view.TableView',
          data: this.ticketDAO,
        }).addClass(this.myClass('table')).end();
    }
  ],
})