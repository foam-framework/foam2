/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'foam.nanos.mobile.controller',
  name: 'MobileController',
  extends: 'net.nanopay.ui.Controller',

  requires: [
    'foam.nanos.mobile.controller.MobileDAOBrowseControllerView'
  ],

  exports: [
    'isMenuOpen',
    'title',
//    'rightAction'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isMenuOpen'
    },
    'title',
//    'rightAction'
  ],

  css: `
  ^ .foam-u2-stack-StackView {
        margin-top: 8rem;
        overflow: scroll;
        height: calc(100vh - 8rem);
      }
  `,

  methods: [
    async function initE() {
      // adding a listener to track the display width here as well since we don't call super
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      // If we don't wait for the Theme object to load then we'll get
      // errors when trying to expand the CSS macros in these models.
      await this.clientPromise;
      await this.fetchTheme();

      this.client.nSpecDAO.find('appConfig').then(config => {
        this.appConfig.copyFrom(config.service);

        this.AppStyles.create();
        this.InvoiceStyles.create();
        this.ModalStyling.create();

        this.SMEStyles.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        this.BankPadAuthorization.create();

        this.__subContext__.register(this.ConnectSubMenu, 'foam.nanos.menu.SubMenu');
        this.__subContext__.register(this.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        this.__subContext__.register(this.SMEModal, 'foam.u2.dialog.Popup');
        this.__subContext__.register(this.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        this.__subContext__.register(this.VerifyEmailView, 'foam.nanos.auth.ResendVerificationEmail');
        this.__subContext__.register(this.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
        this.__subContext__.register(this.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');
        this.__subContext__.register(this.AbliiOverlayActionListView, 'foam.u2.view.OverlayActionListView');
        this.__subContext__.register(this.MobileDAOBrowseControllerView, 'foam.comics.v2.DAOBrowseControllerView');

        this.themeInstalled.resolve();
      });

      await this.themeInstalled;

      if ( ! this.isIframe() ) {
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
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .tag(this.StackView.create({
                data: this.stack,
                showActions: false
              }))
          .end();
      } else {
        this
          .addClass(this.myClass())
          .start()
            .addClass('stack-wrapper')
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .tag(this.StackView, {
              data: this.stack,
              showActions: false
            })
          .end();
      }
    },
  ]
});
