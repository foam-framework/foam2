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
    'foam.log.LogLevel',
    'foam.nanos.auth.User'
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
              foam.nanos.auth.ResetPassword.NEW_PASSWORD,
              foam.nanos.auth.ResetPassword.CONFIRMATION_PASSWORD);
          },
          errorString: 'Passwords do not match.'
        }
      ]
    },
    {
      class: 'String',
      name: 'token',
      factory: function() {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: 'setting this to true makes password fields to be displayed horizontally',
      value: false,
      hidden: true
    }
  ],

  methods: [
    function init() {
      if ( this.isHorizontal ) {
        this.makeHorizontal();
      }
    },
    {
      name: 'makeHorizontal',
      code: function() {
        this.NEW_PASSWORD.gridColumns = 6;
        this.CONFIRMATION_PASSWORD.gridColumns = 6;
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

      code: function() {
        const user = this.User.create({
          desiredPassword: this.newPassword
        });
        this.resetPasswordToken.processToken(null, user, this.token)
        .then((_) => {
          this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
          this.notify(this.SUCCESS_MSG, '', this.LogLevel.INFO, true);
        }).catch((err) => {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
  ]
});
