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
    ^ {
      background: #ffffff;
      height: 100vh;
    }

    ^ .sizeCenter {
      max-width: 45vw;
      margin: 6% auto;
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
      text-align: center;
      margin-bottom: 0;
    }

    ^ .subtitle {
      color: #525455;
      font-size: 1em;
      line-height: 1.5;
      margin-bottom: 2vh;
      text-align: center;
    }

    ^ .contents {
      max-width: 25vw;
      margin: 0 auto;
    }

    ^ .submitBtn {
      text-align: center;
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
      help: 'Enter your account email and we will send you an email with a link to create a new one.'
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
    { name: 'SUBTITLE', message: 'Enter the email you signed up with and we\'ll send you a link to reset your password.' },
    { name: 'ACTION_PRESS', message: 'click' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      const logo = this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo;
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
            .start('p').addClass('subtitle').add(this.SUBTITLE).end()
            .start(this.SectionView, {
              data: this,
              sectionName: 'emailPasswordSection'
            }).addClass('contents').end()
            .start().addClass('submitBtn').br().br()
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
      label: 'Submit',
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
