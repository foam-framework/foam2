foam.CLASS({
package:'com.google.foam.demos.myTutorial',
name:'myTutorial',
extends:'foam.u2.Controller',

documentation:'FOAM FRONT END TUTORIAL',

requires:['foam.u2.dialog.NotificationMessage'],

css:`
^{

}
^.title{
    display: inline-block;
    opacity: 0.8;
}

^.personImage{
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
        class:'String',
        name:'firstName'
    },
    {
        class:'String',
        name:'lastName'
    },
    {
class:'Int',
name:'age'
    },
    {
    class:'String',
    name:'nationality'
}
],

messages:[
    {name:'title', message:'Create a person'},
    {name:'fnamelabel', message:'First Name:'},
    {name:'lnamelabel', message:'Last Name:'},
    {name:'agelabel', message:'Age:'},
    {name:'nationalitylabel', message:'Nationality:'},
    {name:'confirmbutton', message:'Confirm'},
    {name:'notification', message:'  Has been created!!!'}

],


methods:[
function initE(){
this.
addClass(this.myClass())
.start()
.start('h1').add(this.title).addClass('title').end()
.start({class: 'foam.u2.tag.Image', data:'images/images.jpg'}).addClass('personImage').end()
.br()
.start()
.start().add(this.fnamelabel).addClass('label').end()
.add(this.FIRST_NAME)
.end()
.br()
.start()
.start().add(this.lnamelabel).addClass('label').end()
.add(this.LAST_NAME)
.end()
.br()
.start()
.start().add(this.agelabel).addClass('label').end()
.add(this.AGE)
.end()
.br()
.start()
.start().add(this.nationalitylabel).addClass('label').end()
.add(this.NATIONALITY)
.end()
.br()
//.start()
//.start('button').add(this.confirmbutton).end()
//.add(this.BUTTON)
//.end()
.end()

.add(this.CREATE_BUTTON)

},

function alert(){
    console.log('alert notice will be displayed here...')
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
          message: this.firstName + '' + this.lastName + '' + this.notification
            //type:'error'
       }));
    }
}
]

});