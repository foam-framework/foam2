foam.CLASS({
  package: 'foam.support.view',
  name: 'CreateTicketView',
  extends: 'foam.u2.View',

  requires: [
    'foam.support.model.Ticket', 'foam.u2.PopupView',
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
    .bg{
        padding:20px;
        width: 1280px;
        height: 765px;
        background-color: #edf0f5;
    }
    .div{
      margin-top:80px;
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
    .label{
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
    .foam-u2-TextField {
      margin-bottom:20px;
    margin-top:8px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
  }
    .property-requestor{
      width: 300px;
      height: 40px;
    }
    .property-message{
      width: 1200px;
      height: 240px;
    }
    .property-subject{
      width: 1200px;
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
    padding: 20px;
    margin-top: 20px;
    width: 1240px;
    height: 472px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .foam-u2-ActionView-voidDropDown{
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
//.popUpDropDown {
  padding: 0 !important;
  width: 165px;
  height: 30px;
  font-size: 14px;
  font-weight: 300;
  letter-spacing: 0.2px;
  color: #093649;
  line-height: 30px;
  position: absolute;
}


 .foam-u2-ActionView > button {
    margin:0px;
    box-shadow:none;
    border: solid 0.5px #59a5d5;
    background-color: #59a5d5;
}
.popUpDropDown {
        z-index: 1;
        padding: 0 !important;
        width: 170px;
        height: 140px;
        background: #ffffff;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.19);
        
      }
      .popUpDropDown > div {     
          overflow:hidden;
        box-sizing:border-box;
        width: 170px;
        height: 35px;  
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
      .Pending{
        width: 65px;
        height: 20px;
        text-align:center;
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.67;
        letter-spacing: 0.2px;
        color: #ffffff;
        border-radius: 100px;
        overflow:hidden;
        background-color: #59a5d5;
      }
      .Open {
        width: 49px;
        height: 20px;
        border-radius: 100px;
        background-color: #ee5f71;
        text-align:center;
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.67;
        letter-spacing: 0.2px;
        color: #ffffff;
        overflow:hidden;
      }
      .Updated {
        width: 67px;
        height: 20px;
        border-radius: 100px;
        background-color: #093649;
        text-align:center;
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.67;
        letter-spacing: 0.2px;
        color: #ffffff;
        overflow:hidden;
      }
      .Solved {
        width: 57px;
        height: 20px;
        border-radius: 100px;
        background-color: #a4b3b8;
        text-align:center;
        font-family: Roboto;
        font-size: 12px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.67;
        letter-spacing: 0.2px;
        color: #ffffff;
        overflow:hidden;
      } 
      .Submit-as{
        float: left;
        margin-top:4px;
        margin-right:10px;
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
    },
    'voidMenuBtn_',
    'voidPopUp_',
  ],

  methods: [
    function initE(){
      this.SUPER();
      this.hideSummary = true;
      this.addClass(this.myClass())

  .start().addClass('bg')
      .start('div').addClass('div')
          .start(this.DELETE_DRAFT).addClass('Rectangle-7').end()
          .start(this.VOID_DROP_DOWN,null,this.voidMenuBtn_$).end()
          .start(this.SUBMIT_TICKET).addClass('Rectangle-8').end()
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
      name: 'submitTicket',
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
    },
    {
      name: 'voidDropDown',
      label: '',
      code: function() {
         var self = this;
         
         self.voidPopUp_ = self.PopupView.create({
            x: -140,
            y: 40,
            height:140,
            width: 170,
          })
          self.voidPopUp_.addClass('popUpDropDown')
        
          .start('div').on('click',this.onClick)//on click will change according to conditions
             .start().add('Submit as').addClass('Submit-as').end()
             .start().add('Pending').addClass('Pending').end()
          .end()

          .start('div').on('click',this.onClick)
             .start().add('Submit as').addClass('Submit-as').end()
             .start().add('Open').addClass('Open').end()
          .end()

          .start('div').on('click',this.onClick)
             .start().add('Submit as').addClass('Submit-as').end()
             .start().add('Updated').addClass('Updated').end()
          .end()

          .start('div').on('click',this.onClick)
             .start().add('Submit as').addClass('Submit-as').end()
             .start().add('Solved').addClass('Solved').end()
          .end()

        self.voidMenuBtn_.add(self.voidPopUp_)
      }
    }
  ]
});