foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.PopupView'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'stack',
    'userDAO',
    'hideSummary'
  ],
  
  exports: [
    'as data'
  ],

  properties: [
    'name',
    'voidMenuBtn_',
    'voidPopUp_'
  ],

  css: `
  * {
    box-sizing: border-box;
  }
  ^ {
    width: 992px;
    margin-top: 25px;
    background-color: #edf0f5;
    display: inline-block;
  }
  ^ .foam-u2-UnstyledActionView-backAction {
    float:left;
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
    padding: 0 10px;
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
    height: 40px;
    border-radius: 2px;
    background: #59a5d5; 
  }
  .foam-u2-UnstyledActionView-voidDropDown{
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
    padding: 8px 0 0 11px;
    box-sizing:border-box;
    width: 170px;
    height: 35px;  
    z-index: 10000
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
  .SubmitButton{
    margin-top:1.5px;
    margin-right:10px;
    float: left;
  }
  .SubmitLabel {
    float:right;
  }
  .Submit-as{
    float: left;
    margin-top:2px;
    margin-right:10px;
  }
  ^ .status{
    color: white;
    display: inline-block;
    text-align: center;
    padding-top: 4px;
    font-size: 10px;
  }
  ^ .Missing-Cash-Out-for {
    width: 268px;
    height: 20px;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: 1;
    letter-spacing: 0.3px;
    text-align: left;
    color: #093649;
    float:left;
    display: inline-block;
  }
  ^ .primarydiv{
    width: 1000px;
    height: 20px;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: 1;
    letter-spacing: 0.3px;
    text-align: left;
    color: #093649; 
    margin-top: 80px;
  }
  ^ .sub-div-format {
    width: 488px;
    height: 16px;
    opacity: 0.7;
    font-family: Roboto;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    margin-bottom: 20px;
  }
  .SubmitLabel span{
    font-size: 10px;
    position: relative;
    top: 4px;
  }
  `,

  methods: [
    function initE(){
      var self = this;
      this.hideSummary = true;
      var email = this.data.supportEmail;
    
      //find user associated to ticket
      this.userDAO.find(this.data.requestorId).then(function(a){
        self.name= a.firstName;
      })
      //format date for ui
      var formattedDate = this.formatDate(this.data.createdAt);
      
      this.addClass(this.myClass())
        .start()
          .start(this.BACK_ACTION).end()
          .start(this.VOID_DROP_DOWN, null, this.voidMenuBtn_$).end()
          .start(this.SUBMIT_TICKET).addClass('Rectangle-8')
              .start().add('Submit as').addClass('SubmitButton').end()
              .start().addClass('SubmitLabel')
                .start().addClass(this.data.status$).add(this.data.status$).end()
              .end()
          .end()
        .end()
        .start().addClass('primarydiv')
          .start().addClass('Missing-Cash-Out-for').add(this.data.subject+"...").end()
          .start().add(this.data.status).addClass('generic-status '+ this.data.status).end()
        .end()
        .br()
        .start().addClass('sub-div-format').add("#",this.data.id,"  ","    |     ",formattedDate.month," ",formattedDate.date," ",formattedDate.hours,":",formattedDate.mins,"  ","  |  ",this.name$,"<",this.data.supportEmail,">","  ","  |  Via support@mintchip.ca") 
        .end()
        .tag({ class: 'foam.support.view.ReplyView' });
    },

    function formatDate(date){
      var formattedDate = {
        month: date.toLocaleString("en-us", {month: "short"}),
        date: date.getDate(),
        hours: date.getHours(),
        mins: date.getMinutes()
      }
      return formattedDate;
    }
  ],
  actions: [
    {
      name: 'submitTicket',
      label: '',
      code: function(){
        /*
        var ticket = this.Ticket.create({
          publicMessage: this.message,
          requestorEmail: this.requestor,
          subject: this.subject,
          status: this.status
        });

        this.ticketDAO.put(ticket);*/

        this.stack.push({ class: 'foam.support.view.TicketView' });
      }
    },
    {
      name: 'backAction',
      label: 'Back',
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
        .start('div').on('click', function(){
          self.data.status = 'Pending'
          self.voidPopUp()
        })
          .start().add('Submit as').addClass('Submit-as').end()
          .start().add('Pending').addClass('Pending status').end()
        .end()

        .start('div').on('click', function(){
          self.data.status = 'New'
          self.voidPopUp()
        })
          .start().add('Submit as').addClass('Submit-as').end()
          .start().add('New').addClass('New status').end()
        .end()

        .start('div').on('click', function(){
          self.data.status = 'Solved'
          self.voidPopUp()
        })
          .start().add('Submit as').addClass('Submit-as').end()
          .start().add('Solved').addClass('Solved status').end()
        .end()

        .start('div').on('click', function(){
          self.data.status = 'Updated'
          self.voidPopUp()
        })
          .start().add('Submit as').addClass('Submit-as').end()
          .start().add('Updated').addClass('Updated status').end()
        .end()

        .start('div').on('click', function(){
          self.data.status = 'Open'
          self.voidPopUp()
        })
          .start().add('Submit as').addClass('Submit-as').end()
          .start().add('Open').addClass('Open status').end()
        .end()
                 
        self.voidMenuBtn_.add(self.voidPopUp_)
      }
    }
  ],

  listeners: [
    function voidPopUp(){
      var self = this;
      self.voidPopUp_.close();
    },
  ]
});