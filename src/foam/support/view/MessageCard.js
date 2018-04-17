foam.CLASS({
  package: 'foam.support.view',
  name: 'MessageCard',
  extends: 'foam.u2.View',

  documentation: 'Card for message views',

  requires: [
    'foam.support.model.TicketMessage',
    'foam.support.model.Ticket',
  ],

  imports: [
    'ticketMessageDAO',
    'ticketDAO',
    'userDAO'
  ],  

  javaImports: [
    'java.util.Date'
  ],

  css: `
  * {
    box-sizing: border-box;
  }
  ^ .bg {
    width: 1000px;
    height: auto;
    border-radius: 2px;
    background-color: #ffffff;
    padding-top: 10px;
    padding-bottom: 30px;
  }
  ^ .company-name {
    margin-right: 10px;
    float: left;
    font-family: Roboto;
    font-size: 12px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    padding-left: 20px;
    padding-top: 10px;
    padding-right: 0px;
  }
  ^ .date {   
    font-family: Roboto;
    font-size: 10px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 0.8;
    letter-spacing: 0.2px;
    text-align: left;
    color: #a4b3b8;
    padding-top: 14px;
  }
  ^ .text {
    font-family: Roboto;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    margin-left:10px;
    padding: 30px 0 0 60px;
  }
  ^ .person {
    width: 40;
    height: 40px;
    object-fit: contain;
    display: inline-block;
    float: left;
    margin-left: 10px;
    padding-left: 10px;    
  }
  ^ .tb {
    display: inline-block;
    float: left; 
    width: 0px; 
  }
  hr { 
    background-color: #e6e6e6; 
    height: 1px; 
    border: 0;       
  }
  ^ .spaceline {
    padding-top: 15px;
  }
  `,

  properties: [
   {
     name: 'message',     
   },
   'requestName'
  ],

  methods: [
    function initE(){
      var self = this;
      //find requestorName associated to ticketMessages
      this.userDAO.find(this.message.senderId).then(function(a){
        self.requestName = a.firstName + " " + a.lastName;
      });

      this
        .addClass(this.myClass()) 
        .start('div').addClass('bg')
          .start('hr').end() 
            .start().addClass('spaceline')
              .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/images/person.svg'}).addClass('person')
              .start()
                .start().add(this.requestName$).addClass('company-name').end() 
                .start().add(this.message.dateCreated).addClass('date').end()
              .end()
                .start().add(this.message.message).addClass('text').end()   
            .end()     
        .end()               
    },
  ]
});
