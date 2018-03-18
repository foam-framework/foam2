foam.CLASS({
  package: 'foam.support.modal',
  name: 'NewEmailSupportModal2',
  extends: 'foam.u2.View',

  documentation:'EMAIL SUPPORT VIEW',

  requires: [
    'foam.u2.ModalHeader',
  ],

  imports: [
    'closeDialog'
  ],


  css:`
    ^ {
      height: 200px;
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
      text-align: center;
      color: #ffffff;
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
      text-align: left;
      color: #093649;
    }
    ^ .Mask {
      width: 448px;
      height: 1000px;
      border-radius: 2px;
      background-color: #ffffff;
    }

    ^ .Rectangle-13 {  
      width: 448px;
      height: 40px;
      padding-bottom: 10px;
      background-color: #093649;
    }
    ^ .input {
      margin-top: 15px;
      width: 408px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
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
    `,
    
    messages:[
      { name:'title', message:'Delete Email' },
      { name:'titlelabel', message:'Do you want to delete the email xx@xx.com?' },
      { name:'deleteButton', message:'Delete' },

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
          .start(this.CLOSE_MODAL).addClass('Rectangle-7').end()
          .start('button')
            .add(this.deleteButton).addClass('Rectangle-8')
          .end()
        .end()
      },
        
      function alert(){
        console.log('Your email has been added successfully...');
      }
    ],
        
    actions: [
      {
        name: 'closeModal',
        label: 'Close',
        code: function(X){
          X.closeDialog()
        }
      }
    ]
});