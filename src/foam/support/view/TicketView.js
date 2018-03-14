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
  
 ^ .foam-u2-UnstyledActionView-create
 {
  width: 135px;
  height: 40px;
  background-color: #59a5d5;
  margin-bottom: 20px;
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
         showActions: false
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