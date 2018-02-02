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
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.nanos.auth.SignInView',
    'foam.u2.stack.Stack',
    'foam.nanos.auth.resetPassword.ResetView',
    'foam.u2.stack.StackView'
  ],

  imports: [
    'installCSS',
    'sessionSuccess',
    'window'
  ],

  exports: [
    'as ctrl',
    'group',
    'loginSuccess',
    'logo',
    'requestLogin',
    'signUpEnabled',
    'stack',
    'currentMenu',
    'menuListener',
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
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      factory: function() { return this.Group.create(); }
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
    { class: 'URL', name: 'logo' },
    'currentMenu',
    'webApp',
    'primaryColor',
    'secondaryColor',
    'tableColor',
    'tableHoverColor',
    'accentColor'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

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
        .tag({class: 'foam.nanos.u2.navigation.TopNavigation'})
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end();
    },

    function setDefaultMenu() {
      // Don't select default if menu already set
      if ( this.window.location.hash || ! this.user.group ) return;

      this.groupDAO.find(this.user.group).then(function (group) {
        this.group.copyFrom(group);
        this.window.location.hash = group.defaultMenu;
      }.bind(this));
    },

    function getCurrentUser() {
      var self = this;

      // get current user, else show login
      this.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);
          self.onUserUpdate();
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
          replace(/%PRIMARYCOLOR%/g,    this.primaryColor).
          replace(/%SECONDARYCOLOR%/g,  this.secondaryColor).
          replace(/%TABLECOLOR%/g,      this.tableColor).
          replace(/%TABLEHOVERCOLOR%/g, this.tableHoverColor).
          replace(/%ACCENTCOLOR%/g,     this.accentColor),
          id);
      }
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset')
        return new Promise(function (resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' });
          self.loginSuccess$.sub(resolve);
        });

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'foam.nanos.auth.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ],

  listeners: [
    function onUserUpdate() {
      this.setDefaultMenu();
    },

    function menuListener(m) {
      this.currentMenu = m;
    }
  ]
});
