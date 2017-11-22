/*
  Accessible through browser at location path static/foam2/src/foam/nanos/controller/index.html
  Available on browser console as ctrl. (exports axiom)
*/


foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationController',
  extends: 'foam.u2.Element',
  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },  
  documentation: 'FOAM Application Controller.',
  implements: [
    'foam.nanos.client.Client',
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'stack',
    'as ctrl'
  ],

  imports: [
    'userDAO'
  ],

  css: `
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: #edf0f5;
      margin: 0;
    }
    
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    ^ .foam-nanos-menu-MenuBar {
      background: #093649;
      width: 100%;
      min-width: 992px;
      height: 60px;
      color: white;
      padding-top: 5px;
    }
    ^ .menuBar > div > ul {
      margin-top: 0;
      padding-left: 0;
      font-weight: 100;
      color: #ffffff;
    }
    ^ .foam-nanos-menu-MenuBar li {
      display: inline-block;
      cursor: pointer;
    }
    ^ .menuItem{
      display: inline-block;
      padding: 0px 0px 10px 0px;
      cursor: pointer;
      border-bottom: 4px solid transparent;
      transition: text-shadow;
    }
    ^ .menuItem:hover {
      border-bottom: 4px solid #1cc2b7;
      padding-bottom: 5px;
      text-shadow: 0 0 0px white, 0 0 0px white;
    }
    ^ .selected {
      border-bottom: 4px solid #1cc2b7;
      padding-bottom: 5px;
      text-shadow: 0 0 0px white, 0 0 0px white;
    }
    ^ .menuBar{
      width: 50%;
      overflow: auto;
      white-space: nowrap;
      margin-left: 60px;
    }    
  `,

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      window.onpopstate = function(event) {
        if ( location.hash != null ) {
          var hid = location.hash.substr(1);

          hid && self.menuDAO.find(hid).then(function(menu) {
            menu && menu.launch(this,null);
         })
        }
      };
      window.onpopstate();
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .tag({class: 'foam.nanos.menu.MenuBar'})
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
    }
  ]
});