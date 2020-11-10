/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'AppController',
  extends: 'foam.nanos.controller.ApplicationController',

  requires: [
    'foam.core.Latch',
    'foam.u2.layout.MDDAOController',
    'foam.u2.layout.MDLoginView',
    'foam.u2.layout.MDNotificationMessage',
    'foam.u2.layout.MDStackView'
  ],

  exports: [
    'isMenuOpen'
  ],

  css: `
    ^ body {
      height: 100%;
      overflow: hidden;
    }
    ^ .foam-u2-ActionView {
      border: none !important;
    }
    ^ .foam-u2-ActionView:hover {
      background-color: unset !important;
    }

    ^ .foam-u2-layout-MDStackView {
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    ^ .menuOpen {
      left: -00px;
      transition: .2s;
    }

    ^ .menuClosed {
      left: -60rem;
      transition: .2s;
    }

    ^ toolbar .right {
      padding-right: 3rem;
    }
    ^ toolbar .left i {
      padding-left: 3rem;
    }
    ^ toolbar .title {
      padding-left: 4rem;
      font-weight: 500;
      font-size: 3.5rem;
      width: 100%;
    }
    ^ toolbar .foam-u2-ActionView {
      background-color: unset;
      font-size: 4rem;
    }
    //    TODO: move to toolbar ^
  `,

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'themeInstalled',
      documentation: 'A latch used to wait on theme installation.',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isMenuOpen'
    }
  ],

  methods: [
    async function initE() {

      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      await this.clientPromise;
      await this.fetchTheme();

      this.client.nSpecDAO.find('appConfig').then(config => {
      this.appConfig.copyFrom(config.service);

      this.__subContext__.register(this.MDDAOController,       'foam.comics.v2.DAOBrowseControllerView');
      this.__subContext__.register(this.MDDAOController,       'foam.comics.BrowserView');
      this.__subContext__.register(this.MDLoginView,           'foam.u2.view.LoginView');
      this.__subContext__.register(this.MDNotificationMessage, 'foam.u2.dialog.NotificationMessage');

      this.themeInstalled.resolve();
    });

    await this.themeInstalled;

    this
      .addClass(this.myClass())
      .start()
        .enableClass('login-stack', this.loginSuccess$.map( ls => ! ls ))
        .start('div')
          .tag({ class: 'foam.u2.layout.MDSideNavigation' })
        .end()
        .tag(this.MDStackView.create({
            data: this.stack,
            showActions: false
          }))
      .end()
    }
  ]
});
