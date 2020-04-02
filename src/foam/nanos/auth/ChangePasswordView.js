/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ChangePasswordView',
  extends: 'foam.u2.Controller',

  documentation: `Change Password View: managing two states.
  State one) ResetPassword:  redirect from email link, with a token to update forgotten password,
  State two) UpdatePassword: simple change of password by a logged in user.
  
  Also manages two view types:
  View one) Vertically aligned properties (this.horizontal = false),
  View two) Horizontally aligned properties (this.horizontal = true)`,

  imports: [
    'auth',
    'notify',
    'resetPasswordToken',
    'stack',
    'theme',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.detail.SectionView'
  ],

  css: `
    ^ {
      background: #ffffff;
      height: 100vh;
    }
    ^ .centerVertical {
      max-width: 40vw;
      margin: 6% auto;
    }
    ^ .logoCenterVertical {
      margin: 0 auto;
      text-align: center;
      display: block;
    }
    ^ .horizontal {
      padding: 0 0 1vh 2vh;
      max-width: 98%;
    }
    ^ .logoHorizontal {
      padding-left: 2vh;
    }
    ^ .top-bar {
      background: /*%LOGOBACKGROUNDCOLOUR%*/ #202341;
      width: 100%;
      height: 8vh;
      border-bottom: solid 1px #e2e2e3;
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
      margin-bottom: 0
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

  sections: [
    {
      name: 'resetPasswordSection',
      title: '',
      help: 'Create a new password for your account',
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'horizontal',
      documentation: `This property toggles the view from a centered vertical view to a
      horizontally property display view.`,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'topBarShow',
      documentation: `This property toggles the view from having a top bar displayed.`,
      hidden: true,
      value: true
    },
    {
      class: 'String',
      name: 'token',
      documentation: `This property toggles the view from updating a user password to resetting a user password.`,
      factory: function() {
        var searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    },
    {
      class: 'Password',
      name: 'originalPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      visibility: function(token) {
        return ! token ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Password',
      name: 'newPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      minLength: 6
    },
    {
      class: 'Password',
      name: 'confirmationPassword',
      label: 'Confirm Password',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      validationPredicates: [
        {
          args: ['newPassword', 'confirmationPassword'],
          predicateFactory: function(e) {
            return e.EQ(
              foam.nanos.auth.ChangePasswordView.NEW_PASSWORD,
              foam.nanos.auth.ChangePasswordView.CONFIRMATION_PASSWORD);
          },
          errorString: 'Passwords do not match.'
        }
      ]
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Reset your password' },
    { name: 'SUBTITLE', message: 'Create a new password for your account' },
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated.' }
  ],

  methods: [
    {
      name: 'makeHorizontal',
      code: function(value) {
        // evaluation of this gridColumns on a property does not handle an evaluation, only an int, thus function here managing this.
        this.cls_.getAxiomByName('originalPassword').gridColumns = value ? ( this.token ? 0 : 4 ) : 12;
        this.cls_.getAxiomByName('newPassword').gridColumns = value ? ( this.token ? 6 : 4 ) : 12;
        this.cls_.getAxiomByName('confirmationPassword').gridColumns = value ? ( this.token ? 6 : 4 ) : 12;
      }
    },
    {
      name: 'reset_',
      code: function() {
        this.clearProperty('originalPassword');
        this.clearProperty('newPassword');
        this.clearProperty('confirmationPassword');
        if ( this.token ) window.history.replaceState(null, null, window.location.origin + '/#reset');
      }
    },
    function initE() {
      this.makeHorizontal(this.horizontal);
      this.SUPER();
      const logo = this.theme.largeLogo ? this.theme.largeLogo : this.theme.logo;
      this
        .addClass(this.myClass())
          .start().addClass('top-bar').show(this.topBarShow)
            .start('img')
              .attr('src', logo)
              .callIfElse( this.horizontal, function() {
                this.addClass('logoHorizontal');
              }, function() {
                this.addClass('logoCenterVertical');
              })
            .end()
          .end()
          .start()
            .callIfElse( this.horizontal, function() {
              this.addClass('horizontal');
            }, function() {
              this.addClass('centerVertical');
            })
            .start('h1').addClass('title-top').add(this.TITLE).end()
            .start('p').addClass('subtitle').add(this.SUBTITLE).end()
            .start(this.SectionView, {
              data: this,
              sectionName: 'resetPasswordSection'
            }).addClass('contents').end()
            .br().br()
            .start().addClass('submitBtn')
              .start(this.UPDATE_PASSWORD, { size: 'LARGE' }).end()
              .start(this.RESET_PASSWORD, { size: 'LARGE' }).end()
            .end()
          .end();
      }
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      isAvailable: function() {
        return !! this.token;
      },
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function(X) {
        var user = this.User.create({
          desiredPassword: this.newPassword
        });
        this.resetPasswordToken.processToken(null, user, this.token)
        .then((_) => {
          this.reset_();
          this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
          this.notify(this.SUCCESS_MSG);
        }).catch((err) => {
          this.notify(err.message, 'error');
        });
      }
    },
    {
      name: 'updatePassword',
      isAvailable: function() {
        return ! this.token;
      },
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function(X) {
        this.auth.updatePassword(null, this.originalPassword, this.newPassword)
        .then((result) => {
          this.user.copyFrom(result);
          this.reset_();
          this.notify(this.SUCCESS_MSG);
        })
        .catch((err) => {
          this.notify(err.message, 'error');
        });
      }
    }
  ]
});
