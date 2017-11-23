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
    'user',
    'stack',
    'loginSuccess'
  ],

  exports: [ 'as data' ],

  requires: [
    'foam.nanos.auth.User',
    'foam.comics.DAOCreateControllerView',
    'foam.u2.dialog.NotificationMessage'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 490px;
        margin: auto;
      }
      ^ .sign-in-container{
        padding-top: 20px;
        width: 490px;
        height: 240px;
        border-radius: 2px;
        background-color: #ffffff;
      }
      ^ p{
        display: inline-block;
      }
      ^ .net-nanopay-ui-ActionView-signIn{
        width: 90%;
        margin-left: 25px;
      }
    */}
    })
  ],

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password',
      view: 'foam.u2.view.PasswordView'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start('h1').add("Sign In").end()
        .start().addClass('sign-in-container')
          .start().addClass('label').add("Email Address").end()
          .start(this.EMAIL).addClass('full-width-input').end()
          .start().addClass('label').add("Password").end()
          .start(this.PASSWORD).addClass('full-width-input').end()
          .start(this.SIGN_IN).addClass('full-width-button').end()
        .end()
        .start('div')
          .start('p').add("Don't have an account?").end()
          // .start('p').style({ 'margin-left': '2px' }).addClass('link')
          //   .add("Sign up.")
          //   .on('click', this.signUp)
          // .end()
          // .start('p').style({ 'margin-left': '150px' }).addClass('link')
          //   .add("Forgot Password?")
          //   .on('click', function(){ self.stack.push({ class: 'net.nanopay.ui.forgotPassword.EmailView' })})
          // .end()
        .end()
      .end();
    }
  ],

  listeners: [
    // function signUp(){
    //   var self = this;
    //   var view = foam.u2.ListCreateController.CreateController.create(
    //     null,
    //     this.__context__.createSubContext({
    //       detailView: net.nanopay.auth.ui.UserRegistrationView,
    //       back: this.stack.back.bind(this.stack),
    //       dao: this.userDAO,
    //       factory: function() {
    //         return self.User.create();
    //       },
    //       showActions: false
    //     }));
    //   this.stack.push(view);
    // }
  ],

  actions: [
    {
      name: 'signIn',
      label: 'Sign In',
      code: function(X){
        var self = this;

        if ( ! this.email ) {
          this.add(this.NotificationMessage.create({ message: 'Please enter an email address', type: 'error' }));
          return;
        }

        if ( ! this.password ) {
          this.add(this.NotificationMessage.create({ message: 'Please enter a password', type: 'error' }));
          return;
        }

        this.auth.loginByEmail(null, this.email, this.password).then(function(user){
          self.loginSuccess = user ? true : false;
          self.user.copyFrom(user);
          // self.stack.push({ class: 'net.nanopay.invoice.ui.InvoiceDashboardView' });
        }).catch(function(a) {
          self.add(self.NotificationMessage.create({ message: a.message + '. Please try again.', type: 'error' }))
        });
      }
    }
  ]
});
