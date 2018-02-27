foam.CLASS({
    package: 'com.google.foam.demos.myTutorial',
    name: 'myTutorial',
    extends: 'foam.u2.Controller',

    documentation: 'FOAM front end tutorial',

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
        class: 'String',
        name: 'firstName'
    },
    {
        class: 'String',
        name: 'lastName'
    },
    {
        class: 'Int',
        name: 'age'
    },
    {
        class: 'String',
        name: 'nationality'
    }
],

messages: [
    { name: 'title', message: 'Create a Person' },
    { name: 'firstNameLabel', message: 'First Name' },
    { name: 'lastNameLabel', message: 'Last Name' },
    { name: 'ageLabel', message: 'Age'},
    { name: 'nationalityLabel', message: 'Nationality' },
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
                .start({class: 'foam.u2.tag.Image', data: 'images/person.jpg'}).end()
            .end()

            .start()
                .start().add(this.firstNameLabel).addClass('label').end()
                .start(this.FIRST_NAME).end()
            .end()

            .start()
                .start().add(this.lastNameLabel).addClass('label').end()
                .start(this.LAST_NAME).end()
            .end()

            .start()
                .start().add(this.ageLabel).addClass('label').end()
                .start(this.AGE).end()
            .end()

            .start()
                .start().add(this.nationalityLabel).addClass('label').end()
                .start(this.NATIONALITY).end()
            .end()

            //.start()
            .add(this.CREATE_PERSON)
                
            .end();
    },
    function alert(){
        console.log('alert');
    }
],

actions: [
    {
        name: 'createPerson',
        label: 'Create',
        //icon: ''
        isAvailable: function(){
            return this.age > 18;
        },
        code: function(){
            //var self = this;
            this.alert();
            this.add(this.NotificationMessage.create({
                message: this.firstName + ' ' + this.lastName + ' ' + this.notificationMessage
            }))
        }
    }

]

});