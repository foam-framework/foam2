/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ForgotPasswordView',
  extends: 'foam.u2.View',

  documentation: 'Forgot Password Resend View',

  imports: [
    'notify',
    'resetPasswordToken',
    'stack',
    'theme'
  ],

  css: `
    ^ .sizeCenter {
      max-width: 30vw;
      margin: 6% auto;
    }
    ^ .center {
      text-align: center;
    }
    ^ .top-bar {
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
      width: 100%;
      height: 8vh;
      border-bottom: solid 1px #e2e2e3
    }

    ^ .top-bar img {
      height: 4vh;
      padding-top: 2vh;
      display: block;
      margin: 0 auto;
    }

    ^ .title-top {
      font-size: 2.5em;
      padding-top: 2vh;
      font-weight: bold;
    }
  `,

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.detail.SectionView'
  ],

  sections: [
    {
      name: 'emailPasswordSection',
      title: '',
      help: `Enter your account email and we will send you an email with a link to create a new one.`
    }
  ],

  properties: [
    {
      class: 'EMail',
      name: 'email',
      section: 'emailPasswordSection',
      required: true
    }
  ],

  messages: [
    { name: 'INSTRUC_ONE', message: 'Password reset instructions were sent to' },
    { name: 'INSTRUC_TWO', message: 'Please check your inbox to continue.' },
    { name: 'REDIRECTION_TO', message: 'Back to Sign in' },
    { name: 'TITLE', message: 'Forgot your password?' },
    { name: 'ACTION_PRESS', message: 'click' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      let logo = this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo;
      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .start().addClass('top-bar')
            .start('img')
              .attr('src', logo)
            .end()
          .end()
          .start().addClass('sizeCenter')
            .start('h1').addClass('title-top').add(this.TITLE).end()
            .start(this.SectionView, {
              data: this,
              sectionName: 'emailPasswordSection'
            }).end()
            .start().addClass('center').br().br()
              .start(this.SEND_EMAIL, { size: 'LARGE' }).end()
              .br().br()
              .start().addClass('link')
                .add(this.REDIRECTION_TO)
                .on(this.ACTION_PRESS, () => {
                  this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
                })
              .end()
            .end()
          .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'sendEmail',
      label: 'Send reset password email',
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function(X) {
        var user = this.User.create({ email: this.email });
        this.resetPasswordToken.generateToken(null, user).then((_) => {
          this.notify(`${this.INSTRUC_ONE} ${this.email}. ${this.INSTRUC_TWO}`);
          this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
        })
        .catch((err) => {
          this.notify(err.message, 'error');
        });
      }
    }
  ]
});
