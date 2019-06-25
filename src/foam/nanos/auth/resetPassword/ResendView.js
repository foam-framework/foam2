/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResendView',
  extends: 'foam.u2.Controller',

  documentation: 'Forgot Password Resend View',

  imports: [
    'resetPasswordToken',
    'stack'
  ],


  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  css:`
    ^{
      width: 490px;
      margin: auto;
    }
    ^ .Message-Container{
      width: 490px;
      height: 145px;
      border-radius: 2px;
      background-color: #ffffff;
      padding-top: 5px;
    }
    ^ .Forgot-Password{
      width: 236px;
      height: 30px;
      font-family: Roboto;
      font-size: 30px;
      font-weight: bold;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 20px;
      margin-bottom: 30px;
    }
    ^ p{
      display: inline-block;
    }
    ^ .link{
      margin-left: 2px;
      color: #59a5d5;
      cursor: pointer;
    }
    ^ .Instructions-Text{
      width: 450px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 15px;
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 20px;
    }
    ^ .Resend-Button{
      width: 450px;
      height: 40px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      margin-left: 20px;
      margin-right: 20px;
      background: #ffffff;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      color: #59a5d5;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    }
  ],

  messages: [
    { name: 'Instructions', message: `We've sent the instructions to your email. Please check your inbox to continue.` }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('Forgot-Password').add('Forgot Password').end()
          .start().addClass('Message-Container')
            .start().addClass('Instructions-Text').add(this.Instructions).end()
            .start(this.RESEND_EMAIL).addClass('Resend-Button').end()
          .end()
          .start('p').add('Remember your password?').end()
          .start('p').addClass('link')
            .add('Sign in.')
            .on('click', function() {self.stack.push({ class: 'foam.nanos.auth.SignInView' })})
        .end()
      .end();

      this.add(self.NotificationMessage.create({ message: 'Password reset instructions sent to ' + self.email }));
    }
  ],

  actions: [
    {
      name: 'resendEmail',
      label: 'Resend Email',
      code: function(X) {
        var self = this;

        var user = this.User.create({ email: this.email });
        this.resetPasswordToken.generateToken(null, user).then(function(result) {
          self.add(self.NotificationMessage.create({ message: 'Password reset instructions sent to ' + self.email }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
