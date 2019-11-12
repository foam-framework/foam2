foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SignIn',

  documentation: `User Signin model to be used with LoginView.
  `,

  imports: [
    'auth',
    'loginSuccess',
    'notify',
    'stack',
    'user'
  ],

  implements: [
    'foam.core.Validatable',
    'foam.nanos.auth.Authorizable'
  ],

  messages: [
    { name: 'TITLE', message: 'Welcome!' },
    { name: 'FOOTER_TXT', message: 'Not a user yet?' },
    { name: 'FOOTER_LINK', message: 'Create an account' },
    { name: 'SUB_FOOTER_LINK', message: 'Forgot password?' }
  ],

  properties: [
    {
      name: 'dao_',
      hidden: true
    },
    {
      class: 'String',
      name: 'email',
      view: {
        class: 'foam.u2.TextField',
        focused: true
      },
      visibilityExpression: function(disableEmail_) {
        return disableEmail_ ?
          foam.u2.Visibility.DISABLED : foam.u2.Visibility.RW;
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    },
    {
      class: 'Boolean',
      name: 'disableEmail_',
      hidden: true
    },
    {
      class: 'String',
      name: 'token_',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'footerLink',
      code: function(topBarShow_, param) {
        this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignUp', topBarShow_: topBarShow_, param: param }, this);
      }
    },
    {
      name: 'subfooterLink',
      code: function() {
        this.stack.push({
          class: 'foam.nanos.auth.resetPassword.ForgotPasswordView'
        });
      }
    }
  ],

  actions: [
    {
      name: 'login',
      label: 'Sign in',
      code: function(X) {
        this.auth.loginByEmail(X, this.email, this.password).then(
          (logedInUser) => {
            if ( ! logedInUser ) return;
            logedInUser.signUpToken = this.token_;
            this.dao_.put(logedInUser).then((updatedUser)=>{
              this.user.copyFrom(updatedUser);
              if ( !! this.user && this.user.twoFactorEnabled ) {
                this.loginSuccess = false;
                window.history.replaceState({}, document.title, '/');
                this.stack.push({
                  class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
                });
              } else {
                this.loginSuccess = !! this.user;
                if ( ! this.user.emailVerified ) {
                  this.stack.push({
                    class: 'foam.nanos.auth.ResendVerificationEmail'
                  });
                } else {
                  // This is required for signin
                  window.location.hash = '';
                  window.location.reload();
                }
              }
            }).catch(
              (err) => {
                console.warn(err.message);
                this.notify('There was an issue with logging in.', 'error');
              }
            );
          }
        ).catch(
          (err) => {
            console.warn(err.message);
            this.notify('There was a problem logging in.', 'error');
        });
      }
    }
  ]
});
