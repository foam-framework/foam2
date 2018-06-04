foam.CLASS({
  package: 'foam.u2',
  name: 'ModalHeader',
  extends: 'foam.u2.View',

  documentation: 'Modal Container close/title use in modal class to append title & close buttons.',

  imports: [
    'stack',
    'closeDialog'
  ],

  properties: [
    'title'
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
    }
    ^ .container{
      height: 40.8px;
      background-color: #093649;
      margin-bottom: 20px;
    }
    ^ .title{
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      text-align: left;
      color: #ffffff;
      margin-left: 19px;
      display: inline-block;
    }
    ^ .close{
      width: 24px;
      height: 24px;
      margin-top: 5px;
      cursor: pointer;
      position: relative;
      top: 4px;
      right: 20px;
      float: right;
    }
    ^ .foam-u2-ActionView-closeModal{
      position: relative;
      right: 0px;
      width: 50px;
      height: 40px;
      background: transparent;
      margin-top: 0;
      top: 0;
      right: 0;
      border: none;
    }
  `,

  methods: [
    function initE(){
    this.SUPER();
    var self = this;

    this
    .addClass(this.myClass())
      .start()
        .start()
          .start().addClass('container')
            .start().addClass('title').add(this.title).end()
            .start(this.CLOSE_MODAL).addClass('close').end()
          .end()
        .end()
      .end()
    }
  ],

  actions: [
    {
      name: 'closeModal',
      icon: 'ic-cancelwhite.svg',
      code: function(X){
        X.closeDialog()
      }
    }
  ]
});
