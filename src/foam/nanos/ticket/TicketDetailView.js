/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketDetailView',
  extends: 'foam.u2.view.FObjectView',
  
  implements: ['foam.mlang.Expressions'],
  
  requires: [
    'foam.nanos.ticket.Ticket'
  ],
  
  properties: [
    {
      name: 'type',
    //  name: 'data',
      class: 'FObjectProperty',
      view: {
        class: 'foam.u2.view.FObjectView',
        of: 'foam.nanos.ticket.Ticket'
      },
    },
    {
      // ?? How to set data from FObjectProperty
      name: 'data',
      view: {
        class: 'foam.u2.detail.SectionedDetailView'
      },
      // factory: function() {
      //   return this.Ticket.create();
      // }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start()
        .start('h2')
        .add('Create a Ticket')
        .end()
        .end()
        .start('div')
        .add('Choose a Ticket type')
        .end();
      this.SUPER();
    }
  ]
});
