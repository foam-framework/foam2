/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.support.model',
    name: 'Ticket',

    documentation: 'Ticket Model',

    javaImports: [
      'java.util.Date'
    ],

    tableColumns: [
      'id', 'requestorEmail', 'subject', 'createdAt', 'status'
    ],

    properties: [
      {
        class: 'Long',
        name: 'id',
        visibility: foam.u2.Visibility.RO,
        label:'Ticket ID'
      }, 
      {
        class: 'String',
        name: 'requestorEmail'
      },
      {
        class: 'String',
        name: 'subject',
        label:'Subject',
      },
      {
        class: 'String',
        name: 'publicMessage'
      },
      {
        class: 'Date',
        name: 'createdAt',
        visibility: foam.u2.Visibility.RO,
        label: 'Time',
        factory: function(){
           return new Date();
        },
        javaFactory: 'return new Date();',
        tableCellFormatter: function(state, obj, rel){
          if(!state) return;
          var locale = "en-us";
          var month = state.toLocaleString(locale, {month: "short"});
          var date=state.getDate();
          var year=state.getFullYear();
          this.start().add(month+" "+date+", "+year).end();
        }
      },
      {
        class: 'String',
        name: 'internalNote'
      },
      {
        class: 'String',
        name: 'status',
        label:'Status',
        factory: function(){
          return 'New'
        },
        tableCellFormatter: function(state, obj, rel) {
           this.start()
              .start().add(state).addClass('generic-status '+ state).end()
           .end()
      }
    }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'foam.support.model.Ticket',
  targetModel: 'foam.support.model.TicketMessage',
  forwardName: 'messages',
  inverseName: 'ticketId'
});
