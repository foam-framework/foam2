/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'TwoFactorSignInView',
  extends: 'foam.u2.Controller',

  documentation: 'Two-Factor sign in view',

  imports: [
    'appConfig',
    'loginSuccess',
    'menuDAO',
    'notify',
    'stack',
    'twofactor'
  ],

  css: `
    ^ {
      width: 500px;
      margin: auto;
      margin-top: 20vh;
    }
    ^ .app-link {
      text-decoration: none;
      margin-left: 5px;
    }
    ^ .foam-u2-ActionView-verify {
      width: 91%;
      margin-top: 20px;
    }
    ^ .tfa-container {
      border-radius: 2px;
      margin-top: 26px;
    }
    ^ .img-text {
      display: flex;
    }
    ^ .img-text > p {
      width: 90%;
      margin: 20px;
    }
    ^ .error-msg > span {
      margin-left: 10px;
      position: relative;
      bottom: 3px;
    }
  `,

  constants: [
    { name: 'PHONE_IPHONE_IMAGE', value: 'images/phone-iphone-24-px.png' },
    { name: 'ERROR_ICON', value: 'images/inline-error-icon.svg' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'incorrectCode'
    },
    {
      class: 'String',
      name: 'twoFactorToken',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.MultiBoxInputView',
          incorrectCode$: X.data.incorrectCode$
        };
      }
    }
  ],

  messages: [
    { name: 'TWO_FACTOR_NO_TOKEN', message: 'Please enter a verification code.' },
    { name: 'TWO_FACTOR_LABEL', message: 'Enter verification code' },
    { name: 'TWO_FACTOR_ERROR', message: 'Incorrect code. Please try again.' },
    { name: 'TWO_FACTOR_TITLE', message: 'Two-factor authentication' },
    { name: 'TWO_FACTOR_EXPLANATION', message: `Open your Google Authenticator app on your mobile device to view the 6-digit code and verify your identity` },
    { name: 'TWO_FACTOR_NOTES_1', message: `Need another way to authenticate?` },
    { name: 'TWO_FACTOR_NOTES_2', message: `Contact us` },
  ],

  methods: [
    async function initE() {
      this.SUPER();

      this.start().addClass(this.myClass())
        .start().addClass('tf-container')
          .start('h2').add(this.TWO_FACTOR_TITLE).end()
          .start().addClass('img-text')
            .start('img').attr('src', this.PHONE_IPHONE_IMAGE).end()
            .start('p').add(this.TWO_FACTOR_EXPLANATION).end()
          .end()
          .start('form')
            .addClass('tfa-container')
            .start('label').add(this.TWO_FACTOR_LABEL).end()
            .start()
              .tag(this.TWO_FACTOR_TOKEN)
              .start().addClass('error-msg').show( this.incorrectCode$ )
                .start({
                  class: 'foam.u2.tag.Image',
                  data: this.ERROR_ICON,
                  displayHeight: 16,
                  displayWidth: 16
                }).addClass('error-string')
                .end()
                .start('span').add(this.TWO_FACTOR_ERROR).end()
              .end()
            .end()
            .tag(this.VERIFY)
          .end()
        .end()
        .start()
          .start('strong').add(this.TWO_FACTOR_NOTES_1).end()
          .start('a').addClass('app-link')
            .attrs({ href: 'mailto:' + this.appConfig.supportEmail })
            .add(this.TWO_FACTOR_NOTES_2)
          .end()
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'verify',
      isEnabled: function(twoFactorToken) {
        return twoFactorToken.trim();
      },
      code: function(X) {
        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then((result) => {
          if ( result ) {
            this.menuDAO.cmd_(X, foam.dao.CachingDAO.PURGE);
            this.loginSuccess = true;
          } else {
            this.incorrectCode = true;
            this.loginSuccess = false;
          }
        });
      }
    }
  ]
});
