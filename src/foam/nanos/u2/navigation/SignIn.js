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
    'user',
    'menuDAO'
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
      class: 'EMail',
      name: 'email',
      required: true,
      view: {
        class: 'foam.u2.TextField',
        focused: true
      },
      visibility: function(disableEmail_) {
        return disableEmail_ ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      validationTextVisible: false
    },
    {
      class: 'Password',
      name: 'password',
      required: true,
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
        window.history.replaceState(null, null, window.location.origin);
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
    },
    {
      name: 'nextStep',
      code: function(X) {
        if ( this.user.twoFactorEnabled ) {
          this.loginSuccess = false;
          window.history.replaceState({}, document.title, '/');
          this.stack.push({
            class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
          });
        } else {
          if ( ! this.user.emailVerified ) {
            this.stack.push({
              class: 'foam.nanos.auth.ResendVerificationEmail'
            });
          } else {
            this.menuDAO.cmd_(X, foam.dao.CachingDAO.PURGE);
            window.location.hash = '';
            this.loginSuccess = !! this.user;
          }
        }
      }
    }
  ],

  actions: [
    {
      name: 'login',
      label: 'Sign in',
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: async function(X) {
        this.auth.loginByEmail(X, this.email, this.password).then(
          (logedInUser) => {
            if ( ! logedInUser ) return;
            if ( this.token_ ) {
              logedInUser.signUpToken = this.token_;
              this.dao_.put(logedInUser)
                .then((updatedUser) => {
                  this.user.copyFrom(updatedUser);
                  this.nextStep();
                }).catch((err) => {
                  this.notify(err.message || 'There was an issue with logging in.', 'error');
                });
            } else {
              this.user.copyFrom(logedInUser);
              this.nextStep();
            }
          }
        ).catch(
          (err) => {
            this.notify(err.message || 'There was a problem logging in.', 'error');
        });
      }
    }
  ]
});
