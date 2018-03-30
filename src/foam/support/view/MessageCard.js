foam.CLASS({
  package: 'foam.support.view',
  name: 'MessageCard',
  extends: 'foam.u2.View',

  documentation: 'Card for message views',

  javaImports: [
    'java.util.Date'
  ],

	css: `
  ^ .bg {
    width: 1240px;
    height: 200px;
    border-radius: 2px;
    background-color: #ffffff;
    margin: 20px;
  }
  ^ .company-name {
    width: 77px;
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
    padding-left: 80px;
  }
  ^ .date {
    width: 200px;
    height: 8px;
    font-family: Roboto;
    font-size: 10px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 0.8;
    letter-spacing: 0.2px;
    text-align: left;
    color: #a4b3b8;
    padding-left: 162px;
    padding-right: 890px;
  }
  ^ .text {
    width: 231px;
    height: 96px;
    font-family: Roboto;
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.33;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    padding: 46px 928px 324px 200px;
  }
  ^ .person {
    width: 40px;
    height: 40px;
    object-fit: contain;
    padding: 20px 1180px 0px 20px;
  }
 ^ #v27 {
  display: block;
  
 }
 ^ #v28 {
  display: block;
  float: left;
 }
 ^ #v29 {
  display: block;
  float: right;
 }
  `,
  
  messages: [
    { name: 'nameLabel',  message: 'nanopay' },
    { name: 'textLabel',  message: 'Hello World  !!! Please feel free to surf...\n This is the simple text..' },
  ],

  properties: [
    {
      class: 'Date',
      name: 'currentDate',
      factory: function(){
        return new Date();
      },   
    },
   
  ],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
        .start('div')
          .start().addClass('ticketdiv')
            .start().addClass('bg')
            .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/images/person.png'}).addClass('person')
              .start().add(this.nameLabel).addClass('company-name').end()
                .start().add(this.currentDate$).addClass('date').end()           
            .end()
            .end()
            /*
            .tag({ class: 'foam.support.view.SummaryCard', count$: this.newCount$, status: this.newLabel })
            .tag({ class: 'foam.support.view.SummaryCard', count$: this.updatedCount$, status: this.updatedLabel })
            .tag({ class: 'foam.support.view.SummaryCard', count$: this.openCount$, status: this.openLabel })
            .tag({ class: 'foam.support.view.SummaryCard', count$: this.pendingCount$, status: this.pendingLabel })
            .tag({ class: 'foam.support.view.SummaryCard', count$: this.solvedCount$, status: this.solvedLabel })
            .tag({ selection: this.selection$, class: 'foam.u2.view.TableView', data: this.ticketDAO,}).addClass(this.myClass('table'))*/
          .end()
        .end()
      /*
      this
        .addClass(this.myClass())
          .start().addClass('bg')
            .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/images/person.png'}).addClass('person')
              .start().addClass('company-name')
                  .add(this.nameLabel).addClass().end()
                  .start().addClass('date')
                  .start().add(this.currentDate$).addClass().end()   
              .end()
            .end()
            .end() 
                  .start().add(this.textLabel).addClass('text').end()
          .end()
        .end()
       */
    },
  ]
});