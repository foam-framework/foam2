/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.support.modal',
  name: 'DeleteEmailSupportModal',
  extends: 'foam.u2.View',

  documentation:'EMAIL DELETE MODAL',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.u2.ModalHeader',
    'foam.support.model.SupportEmail',
  ],

  imports: [
    'closeDialog',
    'notify',
    'user',
    'supportEmailDAO'
  ],

  css:`
    ^ {
      height: 230px;
    }
    ^ .label1 {
      width: 338px;
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 40px;
      margin-bottom: 100px;
      
    }
    ^ .Mask {
      width: 448px;
      height: 1000px;
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
      padding: 0 20px;
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
        name: 'status',     
    }
    ],
    
    messages:[
      { name:'titlelabel', message:'Do you want to delete the email xx@xx.com?' },
    ],

    methods:[
      function initE(){
        this.addClass(this.myClass())

        this
        .tag(this.ModalHeader.create({
          title: 'Delete Email'
        }))
        .start().addClass('div2')
          .start().addClass('label1') 
            .add(this.titlelabel)
          .end()
          .start().addClass('div')
          .start(this.CLOSE_MODAL).addClass('Rectangle-7')
          .end()
          .start(this.DELETE_BUTTON).addClass('Rectangle-8')
          .end()
        .end();
      }
    ],
        
    actions: [
      {
        name: 'deleteButton',
        label: 'Delete',
        code: function(X) {
          this.data.status = "Disabled"
          this.supportEmailDAO.put(this.data);
          this.notify('Your email address is disabled and you need to update it.', '', this.LogLevel.WARN, true);
          X.closeDialog();
        }
      },
      {
        name: 'closeModal',
        label: 'Close',
        code: function(X) {
          X.closeDialog();
        }
      }
    ]
});
