/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'EmailView',
  extends: 'foam.u2.Controller',

  documentation: 'Forgot Password Email View',

  imports: [
    'resetPasswordToken',
    'stack'
  ],

  requires: [
    'foam.nanos.auth.resetPassword.ResendView',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^{
      width: 490px;
      margin: auto;
    }

    ^ .Message-Container{
      width: 490px;
      height: 215px;
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
      width: 276px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 15px;
      margin-left: 20px;
      margin-right: 194px;
      margin-bottom: 30px;
    }

    ^ .Email-Text{
      width: 182px;
      height: 16px;
      font-family: Roboto;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 30px;
      margin-bottom: 8px;
      margin-left: 20px;
      margin-right: 288px;
    }

    ^ .Input-Box{
      width: 450px;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 10px;
      padding-left: 5px;
      padding-right: 5px;
      font-family: Roboto;
      font-size: 12px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      font-weight: 300;
      letter-spacing: 0.2px;
    }

    ^ .Next-Button{
      width: 450px;
      height: 40px;
      border-radius: 2px;
      background-color: /*%PRIMARY3%*/ #406dea;
      margin-left: 20px;
      margin-right: 20px;
      margin-bottom: 20px;
      margin-top: 10px;
      text-align: center;
      color: #ffffff;
      font-family: Roboto;
      font-size: 14px;
      line-height: 2.86;
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'signInView',
      factory: function() {
        return { class: 'foam.nanos.auth.SignInView'};
      }
    }
  ],

  messages: [
    { name: 'Instructions', message: 'Please input your registered email address.'}
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
        .start().addClass('Email-Text').add('Email Address').end()
        .start(this.EMAIL).addClass('full-width-input').end()
        .start(this.NEXT).addClass('Next-Button').end()
        .start('p').add('Remember your password?').end()
        .start('p').addClass('link')
          .add('Sign in.')
          .on('click', function() {
            self.stack.push( self.signInView );
          })
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        var self = this;
        var user = this.User.create({ email: this.email });
        this.resetPasswordToken.generateToken(null, user).then(function(result) {
          if ( ! result ) {
            throw new Error('Error generating reset token');
          }
          self.stack.push(self.ResendView.create({ email: self.email }));
        })
        .catch(function(err) {
          self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
        });
      }
    }
  ]
});
