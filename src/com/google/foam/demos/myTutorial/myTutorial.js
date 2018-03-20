foam.CLASS({
package:'com.google.foam.demos.myTutorial',
name:'myTutorial',
extends:'foam.u2.Controller',
documentation:'FOAM front end tutorial',
requires:[
'foam.u2.dialog.NotificationMessage'
],
css:`
^{}
^.title{
display:inline-block;
opacity:0.0;

}
^.label{
    display:inline-block;
    opacity:0.0;
    font-style: oblique;
    }
`,
properties:[
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
{
    name:'title',message:'Create a person'
},
{name:'firstNameLabel',message:'First Name'},
{
    name:'lastNameLabel',message:'Last Name',
},
{
    name:'ageLabel',message:'Age',
},
{
    name:'nationalityLabel',message:'Nationality'
},
{
    name:'notification',message:' has been created.'
}


],
methods:
[
function initE(){
    this
    .addClass(this.myClass())
    .start()
        .start('h1').add(this.title).addClass('title').end()
        //.start({class:'foam.u2.tag.Image',data:'images/dummy.jpg'}).end()
        .start().add(this.firstNameLabel).addClass('label').end()
        .start(this.FIRST_NAME).end()

        .start().add(this.lastNameLabel).addClass('label').end()
        .start(this.LAST_NAME).end()

        .start().add(this.ageLabel).addClass('label').end()
        .start(this.AGE).end()

        .start().add(this.nationalityLabel).addClass('label').end()
        .start(this.NATIONALITY).end()
        .start(this.CREATE_PERSON).end()
    .end();
    },
    function alert(){
        console.log("alert");    
    }
],


actions:
[

    {
       name:'createPerson',
       label:'Create',
       code:function()
       {
           this.alert();
        this.add(this.NotificationMessage.create({

            message:this.firstName+'  '+this.lastName+'  '+this.notification
        }));

       }
             
    }
]


});