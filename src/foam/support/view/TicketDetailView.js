foam.CLASS({
  package: 'foam.support.view',
  name: 'TicketDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.auth.User'
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
    'name'
  ],

  css: `
  ^ {
    width: 992px;
    margin-top: 25px;
    background-color: #edf0f5;
    display: inline-block;
  }
  ^ .foam-u2-UnstyledActionView-backAction {
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
  }
  ^ .main {
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
  }
  `,

  methods: [
    function initE(){
    var self = this;
<<<<<<< HEAD
    var email=this.data.supportEmail;
    this.userDAO.where(this.EQ(this.User.EMAIL, email)).select().then(function(a){
      self.name=a.a[0].firstName;
     })
     var locale = "en-us";
     var month = this.data.createdAt.toLocaleString(locale, {month: "short"});
     var date=this.data.createdAt.getDate();
     var hours=this.data.createdAt.getHours(); 
     var mins= this.data.createdAt.getMinutes()
       this.addClass(this.myClass())
       .start(this.BACK_ACTION).end()
       .start("br").end()
       .start("br").end()
       .start("br").end()
       .start().addClass('primarydiv')
            .start().addClass('Missing-Cash-Out-for').add(this.data.subject+"...").end()
            .start().addClass('generic-status Foam-Ticket-Status-'+this.data.status)
                .start().add(this.data.status).addClass('Foam-generic-status Ticket-Label-'+ this.data.status).end()
           .end()
      .end()
      .start("br").end()
      .start().addClass('main').add("#",this.data.id,"  ","    |     ",month," ",date," ",hours,":",mins,"  ","  |  ",this.name$,"<",this.data.supportEmail,">","  ","  |  Via support@mintchip.ca") 
      .br().br()
      .tag({ class: 'foam.support.view.InternalNote' ,})
      .end()


=======
    this.hideSummary = true;
    var email = this.data.supportEmail;

    this.userDAO.find(this.data.requestorId).then(function(a){
      self.name= a.firstName;
    })

    var locale = "en-us";
    var month = this.data.createdAt.toLocaleString(locale, {month: "short"});
    var date=this.data.createdAt.getDate();
    var hours=this.data.createdAt.getHours(); 
    var mins= this.data.createdAt.getMinutes()
    this.addClass(this.myClass())
    .start(this.BACK_ACTION).end()
    .br().br().br()
    .start().addClass('primarydiv')
    .start().addClass('Missing-Cash-Out-for').add(this.data.subject+"...").end()
    .start().addClass()
    .start().add(this.data.status).addClass('generic-status '+ this.data.status).end()
    .end()
    .end()
    .br()
    .start().addClass('main').add("#",this.data.id,"  ","    |     ",month," ",date," ",hours,":",mins,"  ","  |  ",this.name$,"<",this.data.supportEmail,">","  ","  |  Via support@mintchip.ca") 
    .end()
>>>>>>> 80eb86c6571a9aa45e2e81591c5ba20f6dc0aa0c
    }
  ],
  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'foam.support.view.TicketView'});
      }
    }
  ]
});