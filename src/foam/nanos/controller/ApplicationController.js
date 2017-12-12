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
    'foam.nanos.client.Client'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  imports: [
    'installCSS',
    'sessionSuccess',
    'window'
  ],

  exports: [
    'as ctrl',
    'loginSuccess',
    'logo',
    'requestLogin',
    'signUpEnabled',
    'stack',
    'user',
    'webApp',
    'wrapCSS as installCSS'
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
  `,

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'Boolean',
      name: 'signUpEnabled',
      adapt: function(v) {
        return v === 'false' ? false : true;
      }
    },
    {
      class: 'Boolean',
      name: 'loginSuccess'
    },
    'logo',
    'webApp',
    'primaryColor',
    'secondaryColor',
    'tableColor',
    'accentColor'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      this.user.id$.sub(this.onUserUpdate);

      this.getCurrentUser();

      window.onpopstate = function(event) {
        if ( location.hash != null ) {
          var hid = location.hash.substr(1);

          hid && self.menuDAO.find(hid).then(function(menu) {
            menu && menu.launch(this, null);
          });
        }
      };

      window.onpopstate();
    },

    function initE() {
      this
        .addClass(this.myClass())
        .tag({class: 'foam.u2.navigation.TopNavigation'})
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end();
    },

    function setDefaultMenu() {
      // Don't select default if menu already set
      if ( this.window.location.hash ) return;

      var self = this;
      this.groupDAO.find(this.user.group).then(function (group) {
        self.window.location.hash = group.defaultMenu;
      });
    },

    function getCurrentUser() {
      var self = this;

      // get current user, else show login
      this.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);
        }
      })
      .catch(function (err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    // CSS preprocessor, works on classes instantiated in subContext
    function wrapCSS(text, id) {
      if ( text ) {
        if ( ! this.accentColor ) {
          var self = this;

          this.accentColor$.sub(function(s) {
            self.wrapCSS(text, id);
            s.detach();
          });
        }

        this.installCSS(text.
          replace(/%PRIMARYCOLOR%/g,   this.primaryColor).
          replace(/%SECONDARYCOLOR%/g, this.secondaryColor).
          replace(/%TABLECOLOR%/g,     this.tableColor).
          replace(/%ACCENTCOLOR%/g,    this.accentColor),
          id);
      }
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' ) return;

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'foam.nanos.auth.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ],

  listeners: [
    {
      name: 'onUserUpdate',
      isFramed: true,
      code: function() {
        this.setDefaultMenu();
      }
    }
  ]
});
