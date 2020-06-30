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
    'notify',
    'resetPasswordToken',
    'stack'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User'
  ],

  messages: [
    { name: 'INSTRUC_ONE', message: 'Password reset instructions were sent to' },
    { name: 'INSTRUC_TWO', message: 'Please check your inbox to continue.' },
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
          this.notify(`${this.INSTRUC_ONE} ${this.email}. ${this.INSTRUC_TWO}`, '', this.LogLevel.INFO, true);
          this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, this);
        })
        .catch((err) => {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
