foam.CLASS({
    package: 'foam.support.modal',
    name: 'NewEmailSupportModal1',
    extends: 'foam.u2.View',
  
    documentation:'EMAIL SUPPORT VIEW',

    requires: [
      'foam.u2.ModalHeader',
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
          margin-top:20px;
          margin-left:20px;
          
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
          background-color: #093649;
        }
        ^ .input {
          margin-top: 15px;
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
          {name:'box', message:''},
          {name:'title', message:'New Email'},
          {name:'titlelabel', message:'Please go to the email box to validate the email address before you can connect to the help desk.'},
          {name:'textbox', message:''},
          {name:'OKButton', message:'OK'},
          {name:'notification', message:'  has been added successfully!!!'}
          
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
            .start('button').add(this.OKButton).addClass('Rectangle-8')
              .end()
          .end();
          
            },
        
        function alert(){
            console.log('Your email has been added successfully...')
        }
        ]
        
       /* actions:[
        {
            name: 'nextButton',
            label: 'Next',
            code: function(){
               this.alert();
               this.add(this.NotificationMessage.create({
                  message: 'You can move forward now...',
                    type:'error'
               }));
            }
        },
        {
          name: 'cancelButton',
          label: 'Cancel',
          code: function(){
             this.alert();
             this.add(this.NotificationMessage.create({
                message: 'Your information will not be processed!!!',
                type:'error'
             }));
          }
      },
        {
          name: 'createEmailModal',
          label: 'open modal',
          code: function(){
            this.add(
              foam.u2.dialog.Popup.create(null, this)
              .tag({
                class: 'foam.support.view.modal.CreateEmailModal'
              })
            );
          }
        }
        ]*/
        

  });