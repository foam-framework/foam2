foam.CLASS({
  package: 'foam.support.view',
  name: 'CreateTicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.support.model.Ticket'
  ],

  imports:[
    'ticketDAO',
    'user'
  ],

  exports: [
    'as data'
  ],

  css: `
    .bg{
        padding:20px;
        width: 1280px;
        height: 765px;
        background-color: #edf0f5;
    }
    .Rectangle-7 {
        width: 135px;
        height: 40px;
        border-radius: 2px;
        background-color: rgba(164, 179, 184, 0.1);
        box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #093649;
      }
    .Rectangle-8 {
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
        float: right;
        width: 140px;
        height: 40px;
        border-radius: 2px;
        background-color: #59a5d5;
      }
    .label{
        margin-top:20px;
        width: 484px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
    }
    .foam-u2-IntView {
      margin-top:8px;
    width: 300px;
    height: 40px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
  }
    .foam-u2-TextField {
    margin-top:8px;
    width: 1200px;
    height: 40px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
  }
   
    .New-Ticket {
    margin-top:30px;
    width: 186px;
    height: 20px;
    opacity: 0.6;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: 1;
    letter-spacing: 0.3px;
    text-align: left;
    color: #093649;
  } 
  .bg2 {
    padding: 20px;
    margin-top: 20px;
    width: 1240px;
    height: 472px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  #v16{
    margin-top:8px;
    width: 1200px;
    height: 240px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
  }
  
  `,

  properties: [
    {
      class: 'String',
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

  .start().addClass('bg')
      .start('div').addClass('div')
          .start(this.DELETE_DRAFT).addClass('Rectangle-7').end()
          .start('button').add(this.submitNewLabel).addClass('Rectangle-8').end()
      .end()
      .start().add(this.title).addClass('New-Ticket').end()

    .start().addClass('bg2')

      .start().addClass('label')
        .add('Requestor')
      .end()
      // .startContext({ data: this})
      .start()
        .tag(this.REQUESTOR)
      .end()

      .start().addClass('label')
        .add('Subject')
      .end()
      .start()
        .tag(this.SUBJECT)
      .end()

      .start().addClass('label')
        .add('Message')
      .end()
      .start()
        .tag(this.MESSAGE)
      .end()
      // .endContext()
      .tag(this.SAVE_TICKET)
    .end()
  .end()    
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
    },
    {
      name: 'deleteDraft',
      code: function(){

      }
    }
  ]
});