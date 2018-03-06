foam.CLASS({
    package:'foam.support.ticketlistcontroller',
    name:'TicketListCreateController',
    extends: 'foam.u2.View',
    requires: [
        'foam.u2.TableView',
        'foam.u2.ListCreateController',
        'foam.support.model.Ticket',
        'foam.support.TicketListController.TicketItemView',
      ],
      exports: [ 'as data' ],

      imports: [ 'ticketDAO' ],
      
    //   properties: [
      
    //     {
    //         name: 'table',
    //         factory: function() {
    //           return this.ListCreateController.create({
    //             of: Ticket,
    //             data: this.dao
    //           });
    //         }
    //       }
   
    //   ],

      methods: [
        function initE() {
            var view = this;

            this
              .addClass(this.myClass())
              .start('h2').add('Ticket Table').end()
              .tag({ class: 'foam.u2.ListCreateController', dao: this.ticketDAO})
            //   .call(function outputRecords() {
            //     // Gets records from DAO
            //     view.data.select().then(function(records) {
            //       // Reverses records array for chronological output
            //       view.forEach(records.array.reverse(), function(record) {
            //         view.start('div')
            //           .addClass(view.myClass('timelineRecord'))
            //           .start('div').addClass(view.myClass('timeline')).end()
            //           .call(function() {
            //             view.historyItemView.outputRecord(this, record)
            //           })
            //         .end();
            //       })
            //     })
            //   });
        }
    ],
})

