foam.CLASS({
  package: 'foam.support.modal',
  name: 'NewEmailSupportModal',
  extends: 'foam.u2.Controller',

  documentation:'EMAIL SUPPORT MODAL',

  requires: [
    'foam.u2.ModalHeader',
    'foam.support.model.SupportEmail',
    'foam.u2.dialog.Popup',
    'foam.support.modal.NewEmailSupportConfirmationModal',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'closeDialog',
    'supportEmailDAO',
    'user',
    'ctrl'
  ],

  exports:[
    'as data'
  ],

  css:`
    ^ {
      height: 240px;
    }
    ^ .title {
      margin-left: 20px;
      width: 198px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
    }
    ^ .Mask {
      width: 448px;
      height: 231px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ .Rectangle-7 {
      float: left;
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
    }
    ^ .Rectangle-8 {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: #59a5d5;
      float: right;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .div {
      margin-top: 40px; 
    }
    ^ .div2 {
      padding: 20px;
    }
    ^ .input-wide{
      width: 408px;
      height: 40px;
      margin-top: 10px;
    }
    `,

    properties: [
      {
        class: 'String',
        name: 'email'
      },
      {
        class: 'Long',
        name: 'id'
      }
    ],

    messages:[
      { name:'title', message:'New Email' },
      { name:'titlelabel', message:'Input the email address you want to connect to the help desk.' },
    ],

    methods:[
      function initE(){
        this.addClass(this.myClass())

        this
        .tag(this.ModalHeader.create({
          title: 'New Email'
        }))
        .start().addClass('div2')
        .start().addClass('label1') 
            .add(this.titlelabel)
        .end()
        .start(this.EMAIL).addClass('input-wide').end()
        .start().addClass('div')
        .start(this.CLOSE_MODAL).addClass('Rectangle-7')
        .end()
          .startContext({ data : this })
        .start(this.NEXT_BUTTON).addClass('Rectangle-8')
        .end()
          .endContext()
        .end()
      }
    ], 

    actions: [
      {
        name: 'nextButton',
        label: 'Next',
        code: function(X){
        var expr = foam.mlang.Expressions.create();

        if(!this.email) return;
        var self = this;
        // check to see if the user email is existed
        this.supportEmailDAO.where(expr.EQ(this.SupportEmail.EMAIL, this.email)).select().then(
          function(result){
            if (result.a.length == 0) {
              const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              console.log(self.email);
              if (!emailRegex.test(self.email)){
                self.add(self.NotificationMessage.create({ message: 'The email you have entered is invalid, try again.', type: 'error' })); 
                return;
              }
              var email = self.SupportEmail.create({
                email: self.email,
                userId: self.user.id,
                connectedTime: new Date(Date)
              });
              // save support email details in journal
              self.supportEmailDAO.put(email);
              self.ctrl.add(foam.u2.dialog.Popup.create().tag({ class: 'foam.support.modal.NewEmailSupportConfirmationModal'}));
              X.closeDialog()
            } else {
              self.add(self.NotificationMessage.create({ message: 'The email you have entered is existed.', type: 'error' })); 
            }
        });
        }
      },
      {
        name: 'closeModal',
        label: 'Close',
        code: function(X){
          X.closeDialog()
        }
      }
    ]
});