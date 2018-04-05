
foam.CLASS({
    package: 'foam.support.view',
    name: 'InternalNote',
    extends: 'foam.u2.View',

    documentation: 'Internal note for ticket detail view',
    
    properties:[
      {
        name: 'variant'
      },
      {
        class: 'String',
        name: 'message',
        view: 'foam.u2.tag.TextArea',
      },
      {
        name: 'publicUnderline',
        value: true
      },
      {
        name: 'noteUnderline',
        value: false
      },
   ],

    exports: [
      'as data'
    ],

    css: `
    ^ .bg {
        width: 1000px;
        height: 280px;
        border-radius: 2px;
        background-color: #ffffff;
    }
    ^ .firstdiv {
        width: 1200px;
        height: 10px;
        padding-top:20px;  
    }
    ^ .person {
        width: 40px;
        height: 40px;
        object-fit: contain;
        margin-left: 10px;
        padding-left:10px;
    }
    ^ .Public-Reply {
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      border: none;
      background: none;
      position: relative;
      top: -25;
    }
    ^ .Internal-Note {
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      border: none;
      background: none;
      position: relative;
      top: -25; 
    } 
    ^ .Internal-Note:focus{
      outline: none;
    }
    ^ .Public-Reply:focus{
      outline: none;
    }
    ^ .Rectangle {
      width: 820px;
      height: 160px;
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      margin-left:75px;
      margin-top:22px;    
    }
    ^ .background-color{
      background: #093649;
      color:white 
    }
    ^ .border{ 
      border-bottom: 3px solid #1cc2b7;
      font-weight:bold
    }
    ^ .foam-u2-UnstyledActionView:focus{
      outline: none;
    }
      `,
  
    methods: [
      function initE(){
        this.SUPER();
        var self = this;
        this
          .addClass(this.myClass())
            .start().addClass('bg')
              .startContext({ data: this })
                .start().addClass('firstdiv')
                   .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/view/person.svg'}).addClass('person').end()
                   .nbsp().nbsp().nbsp().nbsp().nbsp()
                   .start(this.PUBLIC_REPLY).addClass('Public-Reply').enableClass('border', this.variant$).end()
                   .start(this.INTERNAL_NOTE).addClass('Internal-Note').enableClass('border', this.variant$.map(function(a){ return !a; })).end()
            .end()
              .endContext()
                 .start(this.MESSAGE).addClass('Rectangle').enableClass('background-color', this.variant$).end()
            .end()
      },
    ],
    actions: [
    {
       name:'publicReply',
       label:'Public Reply',
       code:function(X)
       {
        this.variant = false;
        this.message = "";
       }             
    },
    {
      name:'internalNote',
      label:'Internal Note',  
      code:function(X)
      {
        this.variant = true;
        this.message = "";
      }              
   }
]
  });