foam.CLASS({
  package: 'foam.support.modal',
  name: 'NewEmailSupportModal',
  extends: 'foam.u2.Controller',

  documentation:'EMAIL SUPPORT VIEW',

  requires: [
    'foam.u2.ModalHeader',
    'foam.support.model.SupportEmail'
  ],

  imports: [
    'closeDialog',
    'supportEmailDAO',
    'user'
  ],

  exports:[
    'as data'
  ],

  css:`
    ^ {
      height: 220px;
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
    ^ .textbox{
      width: 408px;
      height: 100px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-style: solid;
      border-width: medium;   
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
      { name:'titlelabel', message:'Input the address you want to input on the help desk.' },
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
        
        .start(this.CLOSE_MODAL).addClass('Rectangle-7').end()
          .startContext({ data : this })
        .start(this.NEXT_BUTTON).addClass('Rectangle-8').end()
          .endContext()
        .end()
      }
    ], 

    actions: [
      {
        name: 'nextButton',
        label: 'Next',
        code: function(X){
         // console.log(this.user.id)
          var email = this.SupportEmail.create({
            email: this.email,
            userId:this.user.id
          })

          this.supportEmailDAO.put(email);
        }
      },
       // code: function(){
         // console.log(this.email)
        //}
      
      {
        name: 'closeModal',
        label: 'Close',
        code: function(X){
          X.closeDialog()
        }
      }
    ]
});