foam.CLASS({
    package:'foam.support.createticketview',
    name:'CreateTicketView',
    extends:'foam.u2.Controller',
    requires:['foam.u2.PopupView',
    'foam.u2.dialog.Popup',],
    properties:[
        'voidMenuBtn_',
    'voidPopUp_',
        {
            class:'String',
            name:'requestor'
        },
        {
            class:'String',
            name:'subject'
        },
        {
            class:'String',
            name:'description'
        },

    ],
    css:`
    ^ .bg{
        padding:20px;
        width: 1280px;
        height: 765px;
        background-color: #edf0f5;
       
    }
    ^ .div{
        margin-top:80px;
    }
    ^ .Rectangle-7 {

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
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
          float: right;
          width: 140px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;
        
      }
      ^ .Rectangle-9 {
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
          float: right;
          width: 30px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;
        
      }
      ^ .New-Ticket {
          margin-top:30px;
        width: 186px;
        height: 20px;
        opacity: 0.6;
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
      ^ .bg2 {
          padding: 20px;
          margin-top: 20px;
        width: 1240px;
        height: 472px;
        border-radius: 2px;
        background-color: #ffffff;
      }
      ^ .Change-name {
        margin-top:20px;
        width: 484px;
        height: 16px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: 300;
        font-style: normal;
        font-stretch: normal;
        line-height: normal;
        letter-spacing: 0.2px;
        text-align: left;
        color: #093649;
      }
      ^ .inputreq {
          margin-top:8px;
        width: 300px;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
      }
      ^ .inputsub {
        margin-top:8px;
        width: 1200px;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
      }
      ^ .inputdesc {
        margin-top:8px;
        width: 1200px;
        height: 240px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
      }
      ^ .foam-u2-ActionView-voidDropDown{
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
          float: right;
          width: 30px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;

      }
      ^ .foam-u2-PopupView{
        width: 170px;
        height: 35px;
        background-color: #59a5d5;  
      }

      ^ .foam-u2-ActionView-voidDropDown {
        width: 30px;
        height: 40px;
        background-color: #59a5d5;
        background: #59a5d5;
        border: solid 1px #59a5d5;
        float: right;
      }
     
      ^ .popUpDropDown {
        padding: 0 !important;
        z-index: 100;
        width: 165px;
        background: white;
        opacity: 1;
        box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.19);
        position: absolute;
      }
      ^ .popUpDropDown > div {
        width: 165px;
        height: 30px;
        font-size: 14px;
        font-weight: 300;
        letter-spacing: 0.2px;
        color: #093649;
        line-height: 30px;
      }
      ^ .popUpDropDown > div:hover {
        background-color: #59a5d5;
        color: #59a5d5;
        cursor: pointer;
      }
      ^ button.foam-u2-ActionView{
          margin:0px;
        font-family: Roboto;
        font-size: 14px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 2.86;
        letter-spacing: 0.2px;
        text-align: center;
        color: #ffffff;
          float: right;
          width: 30px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;
      }
      ^ .foam-u2-ActionView:hover{
        background: #59a5d5;
      }
    `,
    messages:[
        {
            name:'title',message:'New Ticket'
        },
        {
            name:'requestorLabel',message:'Requestor'
        },
        {
            name:'subjectLabel',message:'Subject'
        },
        {
            name:'descriptionLabel',message:'Description'
        },
        {
            name:'deleteDraftLabel',message:'Delete Draft'
        },
        {
            name:'submitNewLabel',message:'Submit as New'
        },
        {
            name:'dropDownLabel',message:''
        }
    ],
    methods:[
        function initE(){
            this.addClass(this.myClass())
          

            .start().addClass('bg')
            .start('div').addClass('div')
                .start('button').add(this.deleteDraftLabel).addClass('Rectangle-7').end()
              .start(this.VOID_DROP_DOWN,null,this.voidMenuBtn_$).end()
                //.start('button').add(this.dropDownLabel).addClass('Rectangle-9').end()
                .start('button').add(this.submitNewLabel).addClass('Rectangle-8').end()
              
            .end()
            .start().add(this.title).addClass('New-Ticket').end()
            .start().addClass('bg2')
            .start().add(this.requestorLabel).addClass('Change-name').end()
            .start(this.REQUESTOR).addClass('inputreq').end()
            .start().add(this.subjectLabel).addClass('Change-name').end()
            .start(this.SUBJECT).addClass('inputsub').end()
            .start().add(this.descriptionLabel).addClass('Change-name').end()
            .start(this.DESCRIPTION).addClass('inputdesc').end()
            .end()
            .end();
           
        }
    ],
   actions:[
       {
        name:'deleteDraft',
        label:'Delete Draft',
        code:function()
        {
            this.alert();
         this.add(this.NotificationMessage.create({
 
             
         }));
 
        }
       },
       {
      name: 'voidDropDown',
      label: '',
      code: function(X) {
         var self = this;
         self.voidPopUp_.addClass('popUpDropDown')
         
        self.voidMenuBtn_.add()
      }
    },
      /* {
        name:'submitNew',
        label:'Submit as New',
        view: {
            class: 'foam.u2.view.ChoiceView',
            choices: [
              'All',
              'Week Days',
              'Weekends'
            ]
          },
       
        code:function()
        {
            this.alert();
         this.add(this.NotificationMessage.create({
 
             
         }));
 
        }
       }*/
   ]
});