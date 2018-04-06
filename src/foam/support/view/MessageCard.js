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
    margin: 10px;
  }
  ^ .company-name {
    width: 60px;
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
    padding-left: 20px;
    padding-top: 25px;
    padding-right: 0px;
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
    padding-top: 28px;
    padding-right: 50px;
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
    padding: 60px 928px 324px 80px;
  }
  ^ .person {
    width: 40px;
    height: 40px;
    object-fit: contain;
    padding: 20px 0px 0px 20px;
    display: inline-block;
    float: left;
  }
  ^ .tb {
    display: inline-block;
    float: left; 
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
        .start('div').addClass('bg')
            .start('table').addClass('tb')
              .start('tr')
                .start({class:'foam.u2.tag.Image',data:'../../..//foam/support/images/person.svg'}).addClass('person')
                .start('td').add(this.nameLabel).addClass('company-name').end() 
                .start('td').add(this.currentDate$).addClass('date').end() 
                .end()
              .end()
            .end()
            .start().add(this.textLabel).addClass('text').end()                  
        .end()              
    },
  ]
});
