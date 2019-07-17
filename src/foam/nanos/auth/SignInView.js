/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'SignInView',
  extends: 'foam.u2.View',

  documentation: 'Sign In View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'auth',
    'loginSuccess',
    'signUpEnabled',
    'stack',
    'user'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.comics.DAOCreateControllerView',
    'foam.nanos.auth.resetPassword.EmailView',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ .sign-in-container {
      padding: 24px 16px;
      border-radius: 3px;
      background-color: #ffffff;
      border: 1px solid #e7eaec;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    }
    ^ p {
      display: inline-block;
    }
    ^ input {
      width: 100%;
      margin-bottom: 16px;
    }
    ^ button {
      margin-top: 8px;
    }
    ^ .label {
      height: 16px;
      font-family: Roboto;
      font-size: 12px;
      font-weight: 300;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 8px;
    }
    ^ .link {
      margin-left: 2px;
      color: /*%PRIMARY3%*/ #406dea;
      cursor: pointer;
    }
    ^ .forgot-link {
      margin-left: 2px;
      color: /*%PRIMARY3%*/ #406dea;
      cursor: pointer;
      float: right;
    }
    ^align-left {
      display: flex;
      justify-content: flex-end;
    }
    ^separate {
      display: flex;
      justify-content: space-between;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email',
      view: { class: 'foam.u2.TextField', focused: true }
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView' }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start('h1').add('Sign In').end()
        .start('form').addClass('sign-in-container')
          .start().addClass('label').add('Email Address').end()
          .add(this.EMAIL)
          .start().addClass('label').add('Password').end()
          .add(this.PASSWORD)
          .start()
            .addClass(this.myClass('align-left'))
            .add(this.SIGN_IN)
          .end()
        .end()
        .start('div')
          .addClass(this.myClass('separate'))
          .callIf(this.signUpEnabled, function() {
            this
              .start()
                .start('p')
                  .add('Don\'t have an account?')
                .end()
                .start('p')
                  .style({ 'margin-left': '3px' })
                  .addClass('link')
                  .add('Sign up.')
                  .on('click', self.signUp)
                .end()
              .end();
          })
          .start('p')
            .addClass('forgot-link')
            .add('Forgot Password?')
            .on('click', function() {
              self.stack.push({ class: 'foam.nanos.auth.resetPassword.EmailView' })
            })
          .end()
        .end()
      .end();
    }
  ],

  listeners: [
    function signUp() {
      var self = this;
      var view = foam.u2.ListCreateController.CreateController.create(
        null,
        this.__context__.createSubContext({
          detailView: foam.nanos.auth.SignUpView,
          back: this.stack.back.bind(this.stack),
          dao: this.userDAO,
          factory: function() {
            return self.User.create();
          },
          showActions: false
        }));
      this.stack.push(view);
    }
  ],

  actions: [
    {
      name: 'signIn',
      label: 'Sign In',
      code: function(X) {
        var self = this;

        if ( ! this.email ) {
          this.add(this.NotificationMessage.create({ message: 'Please enter an email address', type: 'error' }));
          return;
        }

        if ( ! this.password ) {
          this.add(this.NotificationMessage.create({ message: 'Please enter a password', type: 'error' }));
          return;
        }

        this.auth.loginByEmail(null, this.email, this.password).then(function(user) {
          if ( user && user.twoFactorEnabled ) {
            self.loginSuccess = false;
            self.user.copyFrom(user);
            self.stack.push({ class: 'foam.nanos.auth.twofactor.TwoFactorSignInView' });
          } else {
            self.loginSuccess = user ? true : false;
            self.user.copyFrom(user);
            self.add(self.NotificationMessage.create({ message: 'Login Successful.' }));
          }
        }).catch(function(a) {
          self.add(self.NotificationMessage.create({ message: a.message, type: 'error' }));
        });
      }
    }
  ]
});
