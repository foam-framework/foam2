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
    'foam.mlang.Expressions',
    'foam.nanos.controller.AppStyles'
  ],

  requires: [
    'foam.nanos.client.ClientBuilder',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.ResendVerificationEmail',
    'foam.nanos.auth.User',
    'foam.nanos.theme.Theme',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.nanos.u2.navigation.FooterView',
    'foam.u2.crunch.CrunchController',
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
    'displayWidth',
    'agent',
    'appConfig',
    'as ctrl',
    'currentMenu',
    'group',
    'lastMenuLaunched',
    'lastMenuLaunchedListener',
    'loginSuccess',
    'theme',
    'menuListener',
    'notify',
    'pushMenu',
    'requestLogin',
    'signUpEnabled',
    'loginVariables',
    'stack',
    'user',
    'webApp',
    'wrapCSS as installCSS',
    'sessionTimer',
    'crunchController'
  ],

  constants: {
    MACROS: [
      'logoBackgroundColour',
      'customCSS',
      'primary1',
      'primary2',
      'primary3',
      'primary4',
      'primary5',
      'approval1',
      'approval2',
      'approval3',
      'approval4',
      'approval5',
      'warning1',
      'warning2',
      'warning3',
      'warning4',
      'warning5',
      'destructive1',
      'destructive2',
      'destructive3',
      'destructive4',
      'destructive5',
      'grey1',
      'grey2',
      'grey3',
      'grey4',
      'grey5',
      'black',
      'inputHeight',
      'inputVerticalPadding',
      'inputHorizontalPadding'
    ]
  },

  messages: [
    { name: 'GROUP_FETCH_ERR', message: 'Error fetching group' },
    { name: 'GROUP_NULL_ERR', message: 'Group was null' },
    { name: 'LOOK_AND_FEEL_NOT_FOUND', message: 'Could not fetch look and feel object.' }
  ],

  css: `
    body {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: /*%GREY5%*/ #f5f7fa;
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

    .truncate-ellipsis {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,

  properties: [
    {
      name: 'loginVariables',
      expression: function(client$userDAO) {
        return {
          dao_: client$userDAO || null,
          imgPath: '',
          group: 'system',
          countryChoices_: [] // empty defaults to entire countryDAO
        };
      }
    },
    {
      class: 'Enum',
      of: 'foam.u2.layout.DisplayWidth',
      name: 'displayWidth',
      value: foam.u2.layout.DisplayWidth.XL
    },
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
      of: 'foam.nanos.auth.User',
      name: 'agent',
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
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.session.SessionTimer',
      name: 'sessionTimer',
      factory: function() {
        return this.SessionTimer.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.CrunchController',
      name: 'crunchController',
      factory: function() {
        return this.CrunchController.create();
      }

    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.theme.Theme',
      name: 'theme'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'topNavigation_',
      factory: function() {
        return this.TopNavigation;
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'footerView_',
      factory: function() {
        return this.FooterView;
      }
    },
    'currentMenu',
    'lastMenuLaunched',
    'webApp'
  ],

  methods: [
    function init() {
      this.SUPER();

      // done to start using SectionedDetailViews instead of DetailViews
      this.__subContext__.register(foam.u2.detail.SectionedDetailView, 'foam.u2.DetailView');

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

        await self.fetchAgent();
        await self.fetchUser();

        // Fetch the group only once the user has logged in. That's why we await
        // the line above before executing this one.
        await self.fetchGroup();
        self.onUserAgentAndGroupLoaded();
      });
    },

    function initE() {
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      this.clientPromise.then(() => {
        this.fetchTheme().then(() => {
          this
            .addClass(this.myClass())
            .start()
              .tag(this.topNavigation_)
            .end()
            .start()
              .addClass('stack-wrapper')
              .tag({
                class: 'foam.u2.stack.StackView',
                data: this.stack,
                showActions: false
              })
            .end()
            .start()
              .tag(this.footerView_)
            .end();
          });
      });
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

    async function fetchUser() {
      /** Get current user, else show login. */
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

      // NOTE: We add a negative lookahead for */, which is used to close a
      // comment in CSS. We do this because if we don't, then when a developer
      // chooses to include a long form CSS macro directly in their CSS such as
      //
      //                       /*%EXAMPLE%*/ #abc123
      //
      // then we don't want this method to expand the commented portion of that
      // CSS because it's already in long form. By checking if */ follows the
      // macro, we can tell if it's already in long form and skip it.
      return css.replace(
        new RegExp('%' + M + '%(?!\\*/)', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function expandLongFormMacro(css, m) {
      // A long-form macros is of the form "/*%PRIMARY_COLOR%*/ blue".
      var M = m.toUpperCase();

      return css.replace(
        new RegExp('/\\*%' + M + '%\\*/[^;]*', 'g'),
        '/*%' + M + '%*/ ' + this.theme[m]);
    },

    function wrapCSS(text, id) {
      /** CSS preprocessor, works on classes instantiated in subContext. */
      if ( text ) {
        var eid = foam.u2.Element.NEXT_ID();

        for ( var i = 0 ; i < this.MACROS.length ; i++ ) {
          let m     = this.MACROS[i];
          var text2 = this.expandShortFormMacro(this.expandLongFormMacro(text, m), m);

            // If the macro was found, then listen for changes to the property
            // and update the CSS if it changes.
            if ( text != text2 ) {
              text = text2;
              this.onDetach(this.theme$.dot(m).sub(() => {
                var el = this.getElementById(eid);
                el.innerText = this.expandLongFormMacro(el.innerText, m);
              }));
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
          self.stack.push({ class: 'foam.nanos.auth.ChangePasswordView' });
          self.loginSuccess$.sub(resolve);
        });
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
        self.loginSuccess$.sub(resolve);
      });
    },

    function notify(data, type) {
      /** Convenience method to create toast notifications. */
      this.add(this.NotificationMessage.create({
        message: data,
        type: type
      }));
    }
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() {
      /**
       * Called whenever the group updates.
       *   - Updates the portal view based on the group
       *   - Update the look and feel of the app based on the group or user
       *   - Go to a menu based on either the hash or the group
       */
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

      // Update the look and feel now that the user is logged in since there
      // might be a more specific one to use now.
      this.fetchTheme();
    },

    function menuListener(m) {
      /**
       * This listener should be called when a Menu item has been launched
       * by some Menu View. Is exported.
       */
      this.currentMenu = m;
    },

    function lastMenuLaunchedListener(m) {
      /**
       * This listener should be called when a Menu has been launched but does
       * not navigate to a new screen. Typically for SubMenus.
       */
      this.lastMenuLaunched = m;
    },

    async function fetchTheme() {
      /**
       * Get the most appropriate Theme object from the server and use it to
       * customize the look and feel of the application.
       */
      var lastTheme = this.theme;

      try {
        if ( this.user && this.user.personalTheme ) {
          // If the user has a personal theme, use that.
          this.theme = await this.user.personalTheme$find;
        } else {
          // If they don't, then we fetch the most appropriate theme based on
          // a few different parameters.
          var predicates = [];

          if ( this.webApp ) {
            predicates.push(this.EQ(this.Theme.APP_NAME, this.webApp));
          }

          if ( this.user && this.user.spid ) {
            predicates.push(this.EQ(this.Theme.SPID, this.user.spid));
          }

          var dao = this.client.themeDAO;
          var predicate = this.TRUE;

          if ( predicates.length ) {
            predicate = this.Or.create({ args: predicates });
          }

          this.theme = await dao.find(predicate);
        }
      } catch (err) {
        this.notify(this.LOOK_AND_FEEL_NOT_FOUND, 'error');
        console.error(err);
        return;
      }

      if ( ! lastTheme || lastTheme.id != this.theme.id ) this.useCustomElements();
    },

    function useCustomElements() {
      /** Use custom elements if supplied by the Theme. */
      if ( ! this.theme ) throw new Error(this.LOOK_AND_FEEL_NOT_FOUND);

      if ( this.theme.topNavigation ) {
        this.topNavigation_ = this.theme.topNavigation;
      }

      if ( this.theme.footerView ) {
        this.footerView_ = this.theme.footerView;
      }
    },
    {
      name: 'updateDisplayWidth',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        this.displayWidth = foam.u2.layout.DisplayWidth.VALUES
          .concat()
          .sort((a, b) => b.minWidth - a.minWidth)
          .find(o => o.minWidth <= window.innerWidth);
      }
    }
  ]
});
