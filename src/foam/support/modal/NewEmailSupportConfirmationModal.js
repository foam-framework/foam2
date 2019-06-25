/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.modal',
  name: 'NewEmailSupportConfirmationModal',
  extends: 'foam.u2.View',

  documentation:'EMAIL SUPPORT CONFIRMATION MODAL',

  requires: [
    'foam.u2.ModalHeader',
    'foam.u2.dialog.Popup'
  ],
  
  imports: [
    'ctrl',
    'closeDialog'
  ],

  css:`
    ^ {
      height: 260px;
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
    ^ .label1 {
      width: 395px;
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top:20px;
      margin-left:20px;
      margin-bottom: 79px;
    }
    ^ .Mask {
      width: 600px;
      height: 180px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ .Rectangle-13 {
      width: 448px;
      height: 40px;
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .input {
      margin-top: 15px;
      margin-bottom: 79px;
      width: 408px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
    ^ .Rectangle-8 {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      background-color: #59a5d5;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      margin-left: 157px;
      margin-top:50px;
    }
    `,

    messages:[
      {name:'title', message:'New Email'},
      {name:'titlelabel', message:'Please go to the email box to validate the email address before you can connect to the help desk.'},  
    ],
        
    methods:[
      function initE(){
        this.addClass(this.myClass())
        this
        .tag(this.ModalHeader.create({
          title: 'New Email'
        }))
        .start().add(this.titlelabel).addClass('label1')
          .end()
          .start(this.CLOSE_MODAL).addClass('Rectangle-8')
          .end()
        .end();
      }
    ],
    
    actions: [
      {
        name: 'closeModal',
        label: 'OK',
        code: function(X){
          X.closeDialog()
        }
      }
    ]
  });
