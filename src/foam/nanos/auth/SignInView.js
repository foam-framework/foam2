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
    ^{
      width: 490px;
      margin: auto;
    }
    ^ .sign-in-container{
      padding-top: 20px;
      width: 490px;
      height: 230px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ p{
      display: inline-block;
    }
    ^ .full-width-button{
      width: 90%;
      height: 40px;
      border-radius: 2px;
      border: solid 1px #59a5d5;
      margin: 0 auto;
      background-color: #59aadd;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      color: #ffffff;
      margin-top: 10px;
    }
    ^ .full-width-input{
      width: 90%;
      height: 40px;
      margin-left: 5%;
      margin-bottom: 15px;
      outline: none;
      padding: 10px;
    }
    ^ .label{
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      text-align: left;
      color: #093649;
      margin-bottom: 8px;
      margin-left: 25px;
    }
    ^ .foam-u2-ActionView-signIn{
      width: 90%;
      margin-left: 25px;
    }
    ^ .foam-u2-ActionView-signIn > span{
      position: relative;
      top: -5px;
    }
    ^ .link{
      margin-left: 2px;
      color: #59a5d5;
      cursor: pointer;
    }
    ^ .forgot-link{
      margin-left: 2px;
      color: #59a5d5;
      cursor: pointer;
      float: right;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
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
        .start('h1').add("Sign In").end()
        .start('form').addClass('sign-in-container')
          .start().addClass('label').add("Email Address").end()
          .start(this.EMAIL).addClass('full-width-input').end()
          .start().addClass('label').add("Password").end()
          .start(this.PASSWORD).addClass('full-width-input').end()
          .start(this.SIGN_IN).addClass('full-width-button').end()
        .end()
        .start('div')
          .callIf(this.signUpEnabled, function(){
            this.start('p').add("Don't have an account?").end()
            .start('p').style({ 'margin-left': '2px' }).addClass('link')
              .add("Sign up.")
              .on('click', self.signUp)
            .end()
          })
          .start('p').style({ 'margin-left': '150px' }).addClass('forgot-link')
            .add("Forgot Password?")
            .on('click', function(){ self.stack.push({ class: 'foam.nanos.auth.resetPassword.EmailView' })})
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
          self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }));
        });
      }
    }
  ]
});
