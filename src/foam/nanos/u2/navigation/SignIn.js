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
    { name: 'SUB_FOOTER_LINK', message: 'Forgot password?' },
    { name: 'ERROR_MSG1', message: 'There was an issue with logging in.' },
    { name: 'ERROR_MSG2', message: 'Please check email and password, and try again.' }
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
      visibilityExpression: function(disableEmail_) {
        return disableEmail_ ?
          foam.u2.Visibility.DISABLED : foam.u2.Visibility.RW;
      },
      validationTextVisible: false
    },
    {
      class: 'Password',
      name: 'password',
      required: true,
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true },
      validationTextVisible: false
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
      code: async function(X) {
        if ( this.errors_ ) {
          // Format an error msg for users
          let errMsg = '';
          for ( i = 0; i < this.errors_.length; i++ ) {
            if ( ! this.errors_[i] ) continue;
            errMsg += this.errors_[i].length == 2 ?
              `${i+1}) ${this.errors_[i][0].name} input is not correct: ${this.errors_[i][1]} ` :
              `${i+1}) Input error: ${this.errors_[i]} `;
          }
          this.notify(errMsg || this.ERROR_MSG2, 'error');
          return;
        }
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
                  this.notify(err.message || this.ERROR_MSG1, 'error');
                });
            } else {
              this.user.copyFrom(logedInUser);
              this.nextStep();
            }
          }
        ).catch(
          (err) => {
            this.notify(err.message || this.ERROR_MSG1, 'error');
        });
      }
    }
  ]
});
