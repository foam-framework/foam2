foam.CLASS({
    package:'foam.support.model.emailSupporttrial',
    name:'emailSupport',
    extends:'foam.u2.Controller',
    
    documentation:'EMAIL SUPPORT',
    
    requires:['foam.u2.dialog.NotificationMessage'],
    
    css:`
    ^{
    
    }
    ^.title{
        display: inline-block;
        opacity: 0.8;
    }
    
    ^.emailImage{
    height: 0.1%;
    width: 0.1%;
    text-align: left;
    }
    
    ^.label{
    font-size: 14px;
    color: light-grey;
    margin-bottom: 5px;
    margin-top: 10px;
    }
    
    `,
    
    properties: [
        {
            class:'EMail',
            name:'email',
            displayWidth: 80,
            width: 100,
            preSet: function (_, val) {
              return val.toLowerCase();
            },
            javaSetter:
            `email_ = val.toLowerCase();
             emailIsSet_ = true;`
          },
       
        {
        class:'String',
        name:'status'
        },
        {
            class: 'DateTime',
            name: 'created_date'
        }
    ],
    
    messages:[
        {name:'title', message:'Email Support'},
        {name:'emaillabel', message:'Email Address:'},
        {name:'datelabel', message:'Connected Date and Time:'},
        {name:'statuslabel', message:'Status:'},
        {name:'confirmbutton', message:'Confirm'},
        {name:'notification', message:'  has been added successfully!!!'}
        
    ],
    
    
    methods:[
    function initE(){
    this.
    addClass(this.myClass())

    .start()

    .start('h1').add(this.title).addClass('title').end()
    .start({class: 'foam.u2.tag.Image', data:'images/images.jpeg'}).addClass('emailImage').end()

    .br()

    .start()
    .start().add(this.emaillabel).addClass('label').end()
    .add(this.EMAIL)
    .end()

    .br()


    .start()
    .start().add(this.statuslabel).addClass('label').end()
    .add(this.STATUS)
    .end()

    .br()

    .start()
    .start().add(this.datelabel).addClass('label').end()
    .add(this.CREATED_DATE)
    .end()

    .br()

    .add(this.CREATE_BUTTON)
    .end()
    
   
    
    },
    
    function alert(){
        console.log('Your email has been added successfully...')
    }
    ],
    
    actions:[
    {
        name: 'createButton',
        label: 'Create',
        code: function(){
            //this.alert();
            //var self=this;
           // self.alert();
           this.alert();
           this.add(this.NotificationMessage.create({
              // message: 'please fill out all the fields required!!!',
              message: this.email + '' + this.notification
                //type:'error'
           }));
        }
    }
    ]
    
    });