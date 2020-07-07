/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.modal',
  name: 'NewEmailSupportModal',
  extends: 'foam.u2.Controller',

  documentation:'EMAIL SUPPORT MODAL',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.support.model.SupportEmail',
    'foam.support.modal.NewEmailSupportConfirmationModal',
    'foam.u2.ModalHeader',
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'closeDialog',
    'ctrl',
    'notify',
    'supportEmailDAO',
    'user',
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
      // background-color: rgba(164, 179, 184, 0.1);
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
      },
      {
        class: 'String',
        name: 'emailRegex',
        factory: function() {
          return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        }
      }
    ],

    messages:[
      { name:'title', message:'New Email' },
      { name:'titlelabel', message:'Input the email address you want to connect to the help desk.' },
      { name:'emailInvalid', message: 'The email you have entered is invalid. Try again.'},
      { name:'emailExists', message: 'The email you have entered already exists.'}
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
        .end();
      }
    ], 

    actions: [
      {
        name: 'nextButton',
        label: 'Next',
        code: function(X) {
          if(!this.email) return;
          var self = this;
          if (!this.emailRegex.test(this.email)) {
            this.notify(this.emailInvalid, '', this.LogLevel.ERROR, true);
            return;
          }

          // check to see if the user email is existed
          this.supportEmailDAO.where(this.EQ(this.SupportEmail.EMAIL, this.email)).select(this.COUNT()).then(
            function(result) {
              if (result.value === 0) {
                var email = self.SupportEmail.create({
                  email: self.email,
                  connectedTime: new Date()
                });
                // save support email details in journal
                self.user.supportEmails.put(email);
                self.ctrl.add(foam.u2.dialog.Popup.create().tag({ class: 'foam.support.modal.NewEmailSupportConfirmationModal' }));
                X.closeDialog();
              } else {
                this.notify(this.emailExists, '', this.LogLevel.ERROR, true);
              }
            }
          );
        }
      },
      {
        name: 'closeModal',
        label: 'Cancel',
        code: function(X) {
          X.closeDialog();
        }
      }
    ]
});
