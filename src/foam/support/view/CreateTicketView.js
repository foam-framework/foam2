foam.CLASS({
  package: 'foam.support.view',
  name: 'CreateTicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.support.model.Ticket', 
    'foam.u2.PopupView',
    'foam.u2.dialog.Popup',
    'foam.nanos.notification.email.POP3Email',
    'foam.nanos.notification.email.POP3EmailService'
  ],

  imports:[
    'ticketDAO',
    'user',
    'hideSummary'
  ],

  exports: [
    'as data'
  ],

  css: `
  * {
    box-sizing: border-box;
  }
  .div{
    margin-top: 40px;
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
  ^ .Rectangle-8 {
    border: solid 0.5px #59a5d5 !important;
    margin: 0px 2px !important;
    -webkit-box-shadow: none;
    font-family: Roboto;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    letter-spacing: 0.2px;
    text-align: center;
    color: #ffffff;
    float: right;
    width: 140px;
    height: 40px;
    border-radius: 2px;
    background: #59a5d5; 
  }
  ^ .label{
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
  .foam-u2-TextField {
    margin-bottom:20px;
    margin-top:8px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
  }
<<<<<<< HEAD
  .property-requestor{
    width: 300px;
=======
  .foam-u2-tag-TextArea {
    margin-top:8px;
  }
  .property-requestorEmail,.property-requestorName{
    width: 450px;
>>>>>>> 91a2ed70177d59a58e4d391fad4fef42eff47a9c
    height: 40px;
  }
  .property-message{
    width: 940px;
    height: 240px;
    border: 1px solid lightgrey;
  }
  .property-subject{
    width: 940px;
    height: 40px;
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
    border-radius: 2px;
    background-color: #ffffff;
    padding: 20px;
  }
  .foam-u2-UnstyledActionView-voidDropDown{
    padding: 0px;
    float: right;
    width: 30px;
    height: 40px;
    background: #59a5d5 !important;
    -webkit-box-shadow: none !important;
    box-shadow:none !important;
    margin: 0px !important;
    border: solid 0.5px #59a5d5 !important;
  }
  .foam-u2-PopupView {
    background: #ffffff !important; 
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 0.2px;
    color: #093649;
    line-height: 30px;
    position: absolute; 
  }
  .foam-u2-UnstyledActionView > button {
    margin:0px;
    box-shadow:none;
    border: solid 0.5px #59a5d5;
    background-color: #59a5d5;
  }
  .popUpDropDown {
    padding: 0 !important;
    width: 170px;
    background: #ffffff;
    z-index: 10000;
    box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
  }
  .popUpDropDown > div {     
    box-sizing:border-box;
    width: 170px;
    height: 35px;  
    z-index: 10000
    padding: 9px 0 0 11px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
  }
  .popUpDropDown > div:hover {
    background-color: rgba(89, 165, 213, 0.3);
  }
  ^ .status{
    color: white;
    display: inline-block;
    text-align: center;
    padding-top: 4px;
    font-size: 10px;
  }
  .Submit-as{
    float: left;
    margin-top:4px;
    margin-right:10px;
    float: left;
  }
  .SubmitLabel {
    float:right;
  }
  .SubmitLabel span{
    font-size: 10px;
    position: relative;
    top: 4px;
  }
  .rname {
    margin-right:20px;
    float:left;
  }
  `,

  properties: [
    {
      class: 'String',
      name: 'requestorEmail'
    },
    {
      class: 'String',
      name: 'requestorName'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'message',
      view: 'foam.u2.tag.TextArea'
    },
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.hideSummary = true;
      this
        .addClass(this.myClass())
        .start(this.DELETE_DRAFT).addClass('Rectangle-7').end()
        .start(this.VOID_DROP_DOWN, null, this.voidMenuBtn_$)
          .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/images/drop_down.png'}).end()
        .end()
        .start(this.SUBMIT_TICKET).addClass('Rectangle-8')
            .start().add('Submit as').addClass('SubmitButton').end()
            .start().addClass('SubmitLabel')
              .start().addClass(this.status$).add(this.status$).end()
            .end()
        .end()

        .start().addClass('bg2')
        .start()
          .start().addClass('rname')
            .start().addClass('label')
              .add('Requestor Name')
            .end()
            .start()
              .tag(this.REQUESTOR_NAME)
            .end()
          .end()

          .start().addClass('remail')
            .start().addClass('label')
              .add('Requestor Email')
            .end()
            .start()
              .tag(this.REQUESTOR_EMAIL)
            .end()
          .end()
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
        .end()
    }
  ],

  actions: [
    {
      name: 'submitTicket',
      label: 'Submit Ticket ' + this.status,
      code: function(){
        
        var ticket = this.Ticket.create({
          publicMessage: this.message,
<<<<<<< HEAD
          requestorId: this.requestor,
=======
          requestorEmail: this.requestorEmail,
          requestorName: this.requestorName,
>>>>>>> 91a2ed70177d59a58e4d391fad4fef42eff47a9c
          subject: this.subject,
          status: this.status
        });

        this.ticketDAO.put(ticket);
      
        
      }
    },
    {
      name: 'deleteDraft',
      code: function(X){
        X.stack.push({ class: 'foam.support.view.TicketView'});
      }
    },
    {
      name: 'voidDropDown',
      label: '',
      code: function(X) {
        var self = this;
        if(this.voidPopUp_) {
          this.voidPopUp_ = null;
          return;
        }
        
        self.voidPopUp_ = self.PopupView.create({
          x: -140,
          y: 40,
          width: 170,
        })
        self.voidPopUp_.addClass('popUpDropDown')
        .start('div').add('Submit as')
          .on('click', this.voidPopUp)//on click will change according to conditions
        .end()
        self.voidMenuBtn_.add(self.voidPopUp_)
      }
    }
  ],


  listeners: [
    function voidPopUp(){
      var self = this;
      self.voidPopUp_.close();
      self.status = status;
    }
  ]
});