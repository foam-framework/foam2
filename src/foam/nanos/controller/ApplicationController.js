/*
  Accessible through browser at location path static/foam2/src/foam/nanos/controller/index.html
  Available on browser console as ctrl. (exports axiom)
*/


foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationController',
  extends: 'foam.u2.Element',

  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },

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

  documentation: 'FOAM Application Controller.',

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
      this
        .addClass(this.myClass())
        .tag({class: 'foam.nanos.menu.MenuBar'})
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
    }
  ]
});
