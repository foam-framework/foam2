foam.CLASS({
    package:'com.google.foam.demos.practise',
    name:'tutorial',
    extends:'foam.u2.Controller',
    requires:[''],
    css:`
    ^ .title{text-align:center;colour:green}
    ^ .main{size:30dp}`,
    properties:[
        {
            class:'String',
            name:'firstName'
        },
        {
            class:'Date',
            name:'dateofbirth'
        },
        {
            class:'Int',
            name:'age'
        }
    ],
    messages:[
        {
            name:'firstnameLabel',message:'Enter your first Name:'
        },
        {
            name:'dateofbirthLabel',message:'Enter you D.O.B:'
        },
        {
            name:'ageLabel',message:'Enter your current age:'
        }
    ],
    methods:[
        function initE(){
            this.addClass(this.myClass())
            .start()
                 .start().add(this.firstnameLabel).addClass('main').end()
                .start(this.FIRST_NAME).end()

                .start().add(this.dateofbirthLabel).end()
                .start(this.DATEOFBIRTH).end()
                .start().add(this.ageLabel).addClass('main').end()
                .start(this.AGE).end()
            .end();
        },
    ],
   
});

