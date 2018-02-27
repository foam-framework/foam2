foam.CLASS({
    package: 'foam.support.model',
    name: 'messageModel',
    extends: 'foam.u2.Controller',

    documentation: 'FOAM front end for Message Model',

    requires: [ 'foam.u2.dialog.NotificationMessage' ],

css: `
    ^{

    }
    ^.title{
        display: inline-block;
        opacity: 0.8;
    }
    ^ .label{
        font-size: 14px;
        color: light-grey;
        margin-bottom: 5px;
        margin-top: 10px;
    }
    ^ .personImage{
        display: inline-block;
        height: 50px;
        width: 50 px;
        vertical-align: middle;
        margin-left: 15px;
        margin-bottom: 15px;
    }
`,

properties: [
    {
        class: 'Long',
        name: 'senderId'
    },
    {
        class: 'Long',
        name: 'receiverId'
    },
    {
        class: 'Date',
        name: 'dateCreated'
    },
    {
        class: 'String',
        name: 'messageId'
    }
],

messages: [
    { name: 'title', message: 'Create a Message Model' },
    { name: 'senderLabel', message: 'Sender ID' },
    { name: 'receiverLabel', message: 'Receiver ID' },
    { name: 'dateLabel', message: 'Date Created' },
    { name: 'messageLabel', message: 'Message ID'},
    { name: 'notificationMessage', message: 'has been created!' }
   

],
imports: [ ],

exports: [ 'alert' ],

methods: [
    function initE(){
        //this.setName();
        var self = this;

        this
            .addClass(this.myClass())
            .start()
                .start('h1').add(this.title).addClass('title').end()
                
            .start()
               // .start({class: 'foam.u2.tag.Image', data: 'images/person.jpg'}).end()
            .end()

            .start()
                .start().add(this.senderLabel).addClass('label').end()
                .start(this.SENDER_ID).end()
            .end()

            .start()
                .start().add(this.receiverLabel).addClass('label').end()
                .start(this.ID).end()
            .end()

            .start()
                .start().add(this.dateLabel).addClass('label').end()
                .start(this.DATE_CREATED).end()
            .end()

            .start()
                .start().add(this.messageLabel).addClass('label').end()
                .start(this.MESSAGE_ID).end()
            .end()

            //.start()
            .add(this.CREATE_MESSAGE)
                
            .end();
    },
    function alert(){
        console.log('alert');
      
    }
],

actions: [
    {
        name: 'createMessage',
        label: 'Create',
        //icon: ''

        code: function(){
            //var self = this;
            this.alert();
            this.add(this.NotificationMessage.create({
                message: this.senderId + ' ' + this.notificationMessage
            }))
        }
    }

]

});