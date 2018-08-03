/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'TwoFactorSignInView',
  extends: 'foam.u2.View',

  documentation: 'Two-Factor sign in view',

  imports: [
    'loginSuccess',
    'twofactor',
    'user'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      width: 490px;
      margin: auto;
    }
    ^ .tfa-container {
      padding-top: 20px;
      width: 490px;
      height: 150px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ p {
      display: inline-block;
    }
    ^ .label {
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      text-align: left;
      color: #093649;
      margin-bottom: 8px;
      margin-left: 25px;
    }
    ^ .full-width-input {
      width: 90%;
      height: 40px;
      margin-left: 5%;
      margin-bottom: 15px;
      outline: none;
      padding: 10px;
    }
    ^ .full-width-button {
      width: 90%;
      height: 40px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      margin: 0 auto;
      background-color: #59aadd;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      color: #ffffff;
      margin-top: 10px;
      margin-left: 25px;
    }
    }
    ^ .full-width-button > span {
      position: relative;
      top: -5px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'twoFactorToken',
    }
  ],

  messages: [
    { name: 'TwoFactorNoTokenError', message: 'Please enter a verification token.' },
    { name: 'TwoFactorSuccess', message: 'Login successful.' },
    { name: 'TwoFactorError', message: 'Login failed. Please try again.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start('h1').add('Two-Factor Authentication').end()
          .start('form').addClass('tfa-container')
            .start().addClass('label').add('Token').end()
            .start(this.TWO_FACTOR_TOKEN).addClass('full-width-input').end()
            .start(this.VERIFY).addClass('full-width-button').end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'verify',
      code: function (X) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.add(this.NotificationMessage.create({ message: this.TwoFactorNoTokenError, type: 'error' }));
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function (result) {
          if ( result ) {
            self.loginSuccess = true;
            self.add(self.NotificationMessage.create({ message: self.TwoFactorSuccess }));
          } else {
            self.loginSuccess = false;
            self.add(self.NotificationMessage.create({ message: self.TwoFactorError, type: 'error' }));
          }
        });
      }
    }
  ]
});
