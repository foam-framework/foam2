foam.CLASS({
  package: 'foam.support.view',
  name: 'CreateTicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.support.model.Ticket'
  ],

  imports:[
    'ticketDAO'
  ],

  exports: [
    'as data'
  ],

  css: `
    .label{
      width: 100%
    }
    .input-field{
      width: 50%;
    }
  `,

  properties: [
    {
      class: 'Long',
      name: 'requestor'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    function initE(){
      this.addClass(this.myClass())
      .start().addClass('label')
        .add('Requestor')
      .end()
      // .startContext({ data: this})
      .start().addClass('input-field')
        .tag(this.REQUESTOR)
      .end()

      .start().addClass('label')
        .add('Subject')
      .end()
      .start().addClass('input-field')
        .tag(this.SUBJECT)
      .end()

      .start().addClass('label')
        .add('Message')
      .end()
      .start().addClass('input-field')
        .tag(this.MESSAGE)
      .end()
      // .endContext()
      .tag(this.SAVE_TICKET)
    }
  ],

  actions: [
    {
      name: 'saveTicket',
      code: function(){

        var ticket = this.Ticket.create({
          publicMessage: this.message,
          requestorId: this.requestor,
          subject: this.subject
        })

        this.ticketDAO.put(ticket);
      }
    }
  ]
});