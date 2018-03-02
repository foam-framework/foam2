foam.CLASS({
    name: 'email',
    package: 'foam.support.view',
    extends: 'foam.u2.View',
  
    
    documentation:'EMAIL SUPPORT VIEW',

    css:`
    ^{
    
    }
    ^ .box{
        width: 400px;
        height: 300px;
        border-radius: 2px;
        background-color: #ffffff;
        border-style: solid;
        border-width: medium;
      }

      ^ .title{
        width: 400px;
        height: 40px;
        background-color: #093649;
        color: white;
        font-size: 15px;
        margin:0;
        padding:1px;
        display: inline-block; 
        text-align: left;
      }
    
  
    
    ^ .label1{
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
      padding:20px;
      padding-left:10px;
      
    }
    
^. textbox{
  
  width: 408px;
  height: 100px;
  background-color: #ffffff;
  border: solid 1px rgba(164, 179, 184, 0.5);
    border-style: solid;
    border-width: medium;

    
}

^. button1{

  width: 135px;
  height: 40px;
  border-radius: 2px;
  background-color: rgba(164, 179, 184, 0.1);
  box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
  border-style: solid;
  border-width: medium;
}

^. button2{
  
  width: 135px;
  height: 40px;
  border-radius: 2px;
  background-color: #59a5d5;
  width: 56px;
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
  border-style: solid;
  border-width: medium;
  padding-left: 100px;
}


    `,
  
        
        messages:[
            {name:'box', message:''},
            {name:'title', message:'New Email'},
            {name:'titlelabel', message:'Input the address you want to input on the help desk'},
            {name:'textbox', message:''},
            {name:'nextButton', message:'Next'},
            {name:'cancelButton', message:'Cancel'},
            {name:'notification', message:'  has been added successfully!!!'}
            
        ],
        
        
        methods:[
        function initE(){
        this.
        addClass(this.myClass())

        .start().addClass('email-modal')
        .start()
        .start().add(this.box).addClass('box')

        .start('h1').add(this.title).addClass('title').end()
        .start().add(this.titlelabel).addClass('label1').end()
        .start().add(this.textbox).addClass('textbox').end()
        .br()
        .br()
        .br()
        .add(this.CANCEL_BUTTON).addClass('button2') .add(this.NEXT_BUTTON).addClass('button1') 

        .end()
        .end()
        .end()
    
        .end()
        
       
        
        },
        
        function alert(){
            console.log('Your email has been added successfully...')
        }
        ],
        
        actions:[
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
        ]
        

  });