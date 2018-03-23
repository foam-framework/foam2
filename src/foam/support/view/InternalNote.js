
foam.CLASS({
    package: 'foam.support.view',
    name: 'InternalNote',
    extends: 'foam.u2.View',
  
    documentation: 'Internal note for ticket detail view',
  
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
      `,
  
    methods: [
      function initE(){
        var self = this;
        this
            .addClass(this.myClass())
                .start().addClass('bg')
                     .start().addClass('firstdiv')
                     .start({class:'foam.u2.tag.Image',data:'../../../person.svg'}).addClass('person').end() 
                     .end() 
                .end()
           .end()
      },
    ]
  });