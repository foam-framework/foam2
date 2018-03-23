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
    height: 466px;
    border-radius: 2px;
    background-color: #ffffff;
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
  }
  ^ .date {
    width: 100%;
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
  }
  `,
  
  messages: [
    { name: 'nameLabel',  message: 'nanopay' },
    { name: 'textLabel',  message: 'Hello World  !!! Please feel free to surf...' },
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
          .start().addClass('bg')
            .start().add(this.nameLabel).addClass('company-name').end()
              .start().add(this.currentDate$).addClass('date').end()
              
            .start().add(this.textLabel).addClass('text').end()
          .end()
        .end()
    },
  ]
});