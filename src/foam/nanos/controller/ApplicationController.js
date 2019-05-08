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
    'foam.nanos.u2.navigation.FooterView',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.session.SessionTimer',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'installCSS',
    'sessionSuccess',
    'window'
  ],

  exports: [
    'appConfig',
    'as ctrl',
    'currentMenu',
    'group',
    'lastMenuLaunched',
    'lastMenuLaunchedListener',
    'loginSuccess',
    'logo',
    'menuListener',
    'notify',
    'pushMenu',
    'requestLogin',
    'signUpEnabled',
    'stack',
    'user',
    'webApp',
    'wrapCSS as installCSS',
    'sessionTimer'
  ],

  constants: {
    MACROS: [ 'primaryColor', 'secondaryColor', 'tableColor', 'tableHoverColor', 'accentColor', 'secondaryHoverColor', 'secondaryDisabledColor', 'destructiveColor', 'destructiveHoverColor', 'destructiveDisabledColor', 'groupCSS', 'backgroundColor' ]
  },

  messages: [
    { name: 'GROUP_FETCH_ERR', message: 'Error fetching group' },
    { name: 'GROUP_NULL_ERR', message: 'Group was null' }
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
    .foam-u2-UnstyledActionView-signIn {
      margin-left: 25px !important;
    }
    .stack-wrapper {
      margin-bottom: -10px;
      min-height: calc(80% - 60px);
    }
    .stack-wrapper:after {
      content: "";
      display: block;
    }
    .foam-u2-UnstyledActionView:focus{
      outline: none;
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
      name: 'appConfig',
      expression: function(client$appConfig) {
        return client$appConfig || null;
      }
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
      name: 'group'
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
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.session.SessionTimer',
      name: 'sessionTimer',
      factory: function () {
        return this.SessionTimer.create();
      }
    },
    'currentMenu',
    'lastMenuLaunched',
    'webApp',
    'primaryColor',
    'secondaryColor',
    'secondaryHoverColor',
    'secondaryDisabledColor',
    'destructiveColor',
    'destructiveHoverColor',
    'destructiveDisabledColor',
    'tableColor',
    'tableHoverColor',
    'accentColor',
    'backgroundColor',
    'groupCSS',
    'topNavigation_',
    'footerView_'
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      window.onpopstate = async function(event) {
        var hid = location.hash.substr(1);
        if ( hid ) {
          if ( self.client ) {
            var menu = await self.client.menuDAO.find(hid);
            menu && menu.launch(this);
          } else {
            self.clientPromise.then(async () => {
              var menu = await self.client.menuDAO.find(hid);
              menu && menu.launch(this);
            });
          }
        }
      };

      this.clientPromise.then(async function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);
        foam.__context__.register(foam.u2.UnstyledActionView, 'foam.u2.ActionView');

        await self.fetchAgent();
        await self.fetchUser();

        // Fetch the group only once the user has logged in. That's why we await
        // the line above before executing this one.
        await self.fetchGroup();
        self.onUserAgentAndGroupLoaded();
      });
    },

    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self
          .addClass(self.myClass())
          .tag('div', null, self.topNavigation_$)
          .start()
            .addClass('stack-wrapper')
            .tag({
              class: 'foam.u2.stack.StackView',
              data: self.stack,
              showActions: false
            })
          .end()
          .tag('div', null, self.footerView_$);

          // Sets up application view
          self.topNavigation_.add(self.TopNavigation.create());
          self.footerView_.add(self.FooterView.create());
      });
    },

    function setPortalView(group) {
      // Replaces contents of top navigation and footer view with group views
      this.topNavigation_ && this.topNavigation_.replaceChild(
        foam.lookup(group.topNavigation).create(null, this),
        this.topNavigation_.children[0]
      );

      this.footerView_ && this.footerView_.replaceChild(
        foam.lookup(group.footerView).create(null, this),
        this.footerView_.children[0]
      );
    },

    async function fetchGroup() {
      try {
        var group = await this.client.auth.getCurrentGroup();
        if ( group == null ) throw new Error(this.GROUP_NULL_ERR);
        this.group = group;
      } catch (err) {
        this.notify(this.GROUP_FETCH_ERR, 'error');
        console.error(err.message || this.GROUP_FETCH_ERR);
      }
    },

    /**
     * Get current user, else show login.
     */
    async function fetchUser() {
      try {
        var result = await this.client.auth.getCurrentUser(null);
        this.loginSuccess = !! result;

        if ( ! result ) throw new Error();

        this.user = result;
      } catch (err) {
        await this.requestLogin();
        return await this.fetchUser();
      }
    },

    async function fetchAgent() {
      this.agent = await this.client.agentAuth.getCurrentAgent();
    },

    function expandShortFormMacro(css, m) {
      /* A short-form macros is of the form %PRIMARY_COLOR%. */
      var M = m.toUpperCase();

      return css.replace(
        new RegExp('%' + M + '%', 'g'),
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

    function pushMenu(menuId) {
      /** Use to load a specific menu. **/
      if ( window.location.hash.substr(1) != menuId ) {
        window.location.hash = menuId;
      }
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' });
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'foam.nanos.auth.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    },

    // This method is for toast notification message
    function notify(message, type) {
      this.add(this.NotificationMessage.create({ message, type }));
    }
  ],

  listeners: [
    /**
     * Called whenever the group updates.
     *   - Updates the portal view based on the group
     *   - Update the macros list based on the group
     *   - Go to a menu based on either the hash or the group
     */
    function onUserAgentAndGroupLoaded() {
      this.setPortalView(this.group);

      for ( var i = 0; i < this.MACROS.length; i++ ) {
        var m = this.MACROS[i];
        if ( this.group[m] ) this[m] = this.group[m];
      }

      if ( ! this.user.emailVerified ) {
        this.loginSuccess = false;
        this.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
        return;
      }

      var hash = this.window.location.hash;
      if ( hash ) hash = hash.substring(1);

      if ( hash ) {
        window.onpopstate();
      } else if ( this.group ) {
        this.window.location.hash = this.group.defaultMenu;
      }
    },

    // This listener should be called when a Menu item has been launched
    // by some Menu View. Is exported.
    function menuListener(m) {
      this.currentMenu = m;
    },

    // This listener should be called when a Menu has been launched but does
    // not navigate to a new screen. Typically for SubMenus
    function lastMenuLaunchedListener(m) {
      this.lastMenuLaunched = m;
    }
  ]
});
