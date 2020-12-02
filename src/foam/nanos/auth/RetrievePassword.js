/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'RetrievePassword',

  documentation: 'Forgot Password Resend Model',

  imports: [
    'ctrl',
    'resetPasswordToken',
    'stack'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  messages: [
    { name: 'INSTRUC_ONE', message: 'Password reset instructions were sent to' },
    { name: 'INSTRUC_TWO', message: 'Please check your inbox to continue' },
    { name: 'REDIRECTION_TO', message: 'Back to Sign in' }
  ],

  sections: [
    {
      name: 'emailPasswordSection',
      title: 'Forgot your password?',
      subTitle: 'Enter the email you signed up with and we\'ll send you a link to reset your password.',
      help: 'Enter your account email and we will send you an email with a link to create a new one.'
    }
  ],

  css: `
    .foam-nanos-auth-ChangePasswordView .foam-u2-layout-Grid {
      width: 75%;
      display: inline-block;
      vertical-align: bottom;
    }

    .foam-nanos-auth-ChangePasswordView .foam-u2-layout-Cols {
      width: auto;
      display: inline-block;
      margin-left: 5%;
      vertical-align: bottom;
      margin-bottom: 2px;
    }

    .foam-nanos-auth-ChangePasswordView .foam-u2-layout-Rows {
      display: block;

    }

    .foam-nanos-auth-ChangePasswordView .foam-u2-detail-SectionedDetailPropertyView-validation-container {
      position: absolute;
      margin-left: 0px;
      display: flex;
    }
  `,

  properties: [
    {
      class: 'EMail',
      name: 'email',
      section: 'emailPasswordSection',
      required: true
    },
    {
      class: 'Boolean',
      name: 'hasBackLink',
      documentation: 'checks if back link to login page is needed',
      value: true,
      hidden: true
    }
  ],

  actions: [
    {
      name: 'sendEmail',
      label: 'Submit',
      section: 'emailPasswordSection',

      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function(X) {
        const user = this.User.create({ email: this.email });
        this.resetPasswordToken.generateToken(null, user).then((_) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: `${this.INSTRUC_ONE} ${this.email}. ${this.INSTRUC_TWO}`,
            type: this.LogLevel.INFO,
            transient: true
          }));
          this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
        })
        .catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message || this.ERROR_MSG,
            type: this.LogLevel.ERROR,
            transient: true
          }));
        });
      }
    }
  ]
});
