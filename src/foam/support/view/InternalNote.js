
foam.CLASS({
    package: 'foam.support.view',
    name: 'InternalNote',
    extends: 'foam.u2.View',
  
    documentation: 'Internal note for ticket detail view',
    
    properties:[
      {
        name:'publicReply',
        label:'Public Reply',
      },
      {
        name:'internalNote',
        label:'Internal Note',
      },
    ],
      css: `
    .bg {
        width: 1240px;
        height: 476px;
        border-radius: 2px;
        background-color: #ffffff;
    }
    .firstdiv {
        width: 70px;
        height: 16px;
    }
    .person {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .Public-Reply {
      width: 70px;
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    .Internal-Note {
      width: 70px;
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
    } 
      `,
  
    methods: [
      function initE(){
        var self = this;
        this
            .addClass(this.myClass())
                .start().addClass('bg')
                     .start().addClass('firstdiv')
                            .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/view/person.svg'}).addClass('person').end()
                            .start(this.PUBLIC_REPLY).addClass('Public-Reply').end()
                            .start(this.INTERNAL_NOTE).addClass('Internal-Note').end()
                     .end() 
                .end()
           .end()
      },
    ]
  });