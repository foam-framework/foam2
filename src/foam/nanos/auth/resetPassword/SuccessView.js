/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'SuccessView',
  extends: 'foam.u2.View',

  documentation: 'Forgot Password Success View',

  imports: [
    'notify',
    'stack'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  css: `
    ^{
      width: 490px;
      margin: auto;
    }

    ^ .Message-Container{
      width: 490px;
      height: 121px;
      border-radius: 2px;
      background-color: #ffffff;
      padding-top: 5px;
    }

    ^ .Reset-Password{
      width: 225;
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

    ^ .success-Text{
      width: 450px;
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 15px;
      margin-left: 20px;
      margin-right: 288px;
      margin-bottom: 20px;
    }

    ^ .Back-Button{
      width: 450px;
      height: 40px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      margin-left: 20px;
      margin-right: 20px;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      color: #59aadd;
      margin-top: 10px;
    }
  `,

  messages: [
    { name: 'Instructions', message: 'Successfully reset password!' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('Reset-Password').add('Reset Password').end()
          .start().addClass('Message-Container')
            .start().addClass('success-Text').add(this.Instructions).end()
            .start().addClass('Back-Button')
              .add('Back to Sign In')
              .on('click', function() {
                window.location.href = '#';
                self.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn' }, self);
              })
            .end()
          .end()
        .end();

      this.notify(this.Instructions, '', this.LogLevel.INFO, true);
    }
  ]
});
