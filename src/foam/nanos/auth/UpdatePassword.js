/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UpdatePassword',

  documentation: 'Update Password Model',

  imports: [
    'auth',
    'notify',
    'resetPasswordToken',
    'user'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated.' }
  ],

  sections: [
    {
      name: 'updatePasswordSection',
      title: 'Update your password',
      subTitle: 'Create a new password for your account',
    }
  ],

  properties: [
    {
      class: 'Password',
      name: 'originalPassword',
      section: 'updatePasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
    },
    {
      class: 'Password',
      name: 'newPassword',
      section: 'updatePasswordSection',
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
      section: 'updatePasswordSection',
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
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: 'setting this to true makes password fields to be displayed horizontally',
      value: true,
      hidden: true
    }
  ],

  methods: [
    function init() {
      if ( this.isHorizontal ) {
        this.makeHorizontal();
      };
    },
    {
      name: 'makeHorizontal',
      code: function() {
        this.ORIGINAL_PASSWORD.gridColumns = 4;
        this.NEW_PASSWORD.gridColumns = 4;
        this.CONFIRMATION_PASSWORD.gridColumns = 4;
      }
    },
    {
      name: 'reset_',
      code: function() {
        this.clearProperty('originalPassword');
        this.clearProperty('newPassword');
        this.clearProperty('confirmationPassword');
      }
    }
  ],

  actions: [
    {
      name: 'updatePassword',
      section: 'updatePasswordSection',

      isEnabled: function(errors_) {
        return ! errors_;
      },

      code: function() {
        this.auth.updatePassword(null, this.originalPassword, this.newPassword)
        .then((result) => {
          this.user.copyFrom(result);
          this.reset_();
          this.notify(this.SUCCESS_MSG, '', this.LogLevel.INFO, true);
        })
        .catch((err) => {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
