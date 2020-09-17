/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.md',
  name: 'Controller',
  extends: 'net.nanopay.ui.Controller',

  requires: [
    'foam.u2.dao.MDBrowserListView',
    'foam.nanos.mobile.ui.AppStyles',
    'foam.core.Latch',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'foam.u2.layout.MDLoginView'
  ],

  css: `
    body {
      overflow: hidden;
    }

    ^ .foam-u2-ActionView {
      border: none !important;
    }
    ^ .foam-u2-ActionView:hover {
      background-color: unset !important;
    }

    ^ .foam-u2-layout-MDToolbarView {
//      background-color: /*%PRIMARY1%*/;
//      box-shadow: 0px 0px 50px 0px blue;
      font-size: 3.5rem;
      height: 10rem;
      z-index: 99;
    }

    ^toolbar {
      flex-grow: 1;
    }

    ^ toolbar .right {
      padding-right: 3rem;
//      width: -webkit-fill-available;
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

    ^ toolbar .right span {
      width: 100%;
    }

    ^ toolbar .foam-u2-ActionView {
      background-color: unset;
      font-size: 4rem;
    }

    ^ .foam-u2-layout-MDRowView {
      padding: 3rem;
    }
    ^ .foam-u2-stack-StackView {
      margin-top: 10rem;
      height: 100rem;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div {
      position: unset;
    }


    ^ .net-nanopay-ui-TopSideNavigation {
      display: none;
    }

    ^ .foam-u2-layout-MDLoginView {
      height: 100%;
      width: 100%;
    }
  `,

  properties: [

  ],

  methods: [
    async function initE() {

      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      await this.clientPromise;
      await this.fetchTheme();

      this.client.nSpecDAO.find('appConfig').then(config => {
        this.appConfig.copyFrom(config.service);

        this.__subContext__.register(this.MDBrowserListView, 'foam.comics.v2.DAOBrowseControllerView');
        this.__subContext__.register(this.MDBrowserListView, 'foam.comics.BrowserView');
        this.__subContext__.register(this.MDLoginView, 'foam.u2.view.LoginView');

      this.themeInstalled.resolve();

      });
      await this.themeInstalled;
        this
          .addClass(this.myClass())
          .add(this.slot( async function(loginSuccess, topNavigation_) {
            if ( ! loginSuccess ) return null;
            await this.themeUpdated;
            return this.E().tag(topNavigation_);
          }))
          .start()
            .addClass('stack-wrapper')
            .enableClass('login-stack', this.loginSuccess$.map( ls => ! ls ))
            .tag(this.StackView.create({
                data: this.stack,
                showActions: false
              }))
          .end()
    }
  ]
});
