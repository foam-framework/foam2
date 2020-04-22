/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ResetPassword',

  documentation: 'Reset Password Model',

  imports: [
    'auth',
    'notify',
    'resetPasswordToken',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.detail.SectionView'
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated.' }
  ],

  sections: [
    {
      name: 'resetPasswordSection',
      title: 'Reset your password',
      subTitle: 'Create a new password for your account',
    }
  ],

  properties: [
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
              foam.nanos.auth.UpdatePassword.NEW_PASSWORD,
              foam.nanos.auth.UpdatePassword.CONFIRMATION_PASSWORD);
          },
          errorString: 'Passwords do not match.'
        }
      ]
    },
    {
      class: 'String',
      name: 'token',
      documentation: `This property toggles the view from updating a user password to resetting a user password.`,
      factory: function() {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    }
  ],

  methods: [
    {
      name: 'reset_',
      code: function() {
        this.clearProperty('originalPassword');
        this.clearProperty('newPassword');
        this.clearProperty('confirmationPassword');
        if ( this.token ) window.history.replaceState(null, null, window.location.origin + '/#reset');
      }
    }
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      section: 'resetPasswordSection',

      isEnabled: function(errors_) {
        return ! errors_;
      },

      code: function(X) {
        const user = this.User.create({
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
  ]
});
