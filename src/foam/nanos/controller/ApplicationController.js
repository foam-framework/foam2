/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
  Accessible through browser at location path static/foam2/src/foam/nanos/controller/index.html
  Available on browser console as ctrl. (exports axiom)
*/
foam.CLASS({
  package: 'foam.nanos.controller',
  name: 'ApplicationController',
  extends: 'foam.u2.Element',

  documentation: 'FOAM Application Controller.',

  implements: [
    'foam.box.Context',
    'foam.nanos.controller.AppStyles'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.ResendVerificationEmail',
    'foam.nanos.auth.SignInView',
    'foam.nanos.auth.User',
    'foam.nanos.auth.resetPassword.ResetView',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  imports: [
    'getElementById',
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
    'lastMenuLaunched',
    'menuListener',
    'lastMenuLaunchedListener',
    'user',
    'webApp',
    'wrapCSS as installCSS'
  ],

  constants: {
    MACROS: [ 'primaryColor', 'secondaryColor', 'tableColor', 'tableHoverColor', 'accentColor' ]
  },

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
      name: 'clientPromise',
      factory: function() {
        var self = this;
        return self.ClientBuilder.create().promise.then(function(cls) {
          self.client = cls.create(null, self);
          return self.client;
        });
      },
    },
    {
      name: 'client',
    },
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
      adapt: function(_, v) {
        return foam.String.isInstance(v) ? v !== 'false' : v;
      }
    },
    {
      class: 'Boolean',
      name: 'loginSuccess'
    },
    { class: 'URL', name: 'logo' },
    'currentMenu',
    'lastMenuLaunched',
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
      self.clientPromise.then(function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);
        self.getCurrentUser();

        window.onpopstate = function(event) {
          if ( location.hash != null ) {
            var hid = location.hash.substr(1);

            hid && self.client.menuDAO.find(hid).then(function(menu) {
              menu && menu.launch(this, null);
            });
          }
        };

        window.onpopstate();
      });
    },

    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self
          .addClass(self.myClass())
          .tag({class: 'foam.nanos.u2.navigation.TopNavigation'})
          .start('div').addClass('stack-wrapper')
            .tag({class: 'foam.u2.stack.StackView', data: self.stack, showActions: false})
          .end();
      });
    },

    function setDefaultMenu() {
      // Don't select default if menu already set
      if ( this.window.location.hash || ! this.user.group ) return;

      this.client.groupDAO.find(this.user.group).then(function (group) {
        this.group.copyFrom(group);

        for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
          var m = this.MACROS[i];
          if ( group[m] ) this[m] = group[m];
        }

        // Don't select default if menu already set
        if ( group && ! this.window.location.hash ) {
          this.window.location.hash = group.defaultMenu;
        }
      }.bind(this));
    },

    function getCurrentUser() {
      var self = this;

      // get current user, else show login
      this.client.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);
          if ( ! self.user.emailVerified ) {
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }
          self.onUserUpdate();
        }
      })
      .catch(function (err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function expandShortFormMacro(css, m) {
      /* A short-form macros is of the form %PRIMARY_COLOR%. */
      var M = m.toUpperCase();

      return css.replace(
        new RegExp("%" + M + "%", 'g'),
        '/*%' + M + '%*/ ' + this[m]);
    },

    function expandLongFormMacro(css, m) {
      // A long-form macros is of the form "/*%PRIMARY_COLOR%*/ blue".
      var M = m.toUpperCase();

      return css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^;]*', 'g'),
        '/*%' + M + '%*/ ' + this[m]);
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

        let eid = foam.u2.Element.NEXT_ID();

        for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
          let m     = this.MACROS[i];
          var text2 = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);

            // If the macro was found, then listen for changes to the property
            // and update the CSS if it changes.
            if ( text != text2 ) {
              text = text2;
              this.slot(m).sub(function() {
                var el = this.getElementById(eid);
                el.innerText = this.expandLongFormMacro(el.innerText, m);
              }.bind(this));
            }
        }

        this.installCSS(text, id, eid);
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

    // This listener should be triggered when a Menu item has been launched AND
    // navigates to a new screen.
    function menuListener(m) {
      this.currentMenu = m;
    },

    // This listener should be triggered when a Menu has been launched but does
    // not navigate to a new screen. Typically for SubMenus
    function lastMenuLaunchedListener(m) {
      this.lastMenuLaunched = m;
    }
  ]
});
