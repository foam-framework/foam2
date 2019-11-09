foam.CLASS({
  package: 'foam.core',
  name: 'SignIn',
  extends: 'foam.u2.Controller',

  documentation: `User Signin model to be used with LoginView.
    group_: passes the group to SignUp
  `,

  imports: [
    'auth',
    'loginSuccess',
    'notify',
    'signUpDAO',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
  ],

  messages: [
    { name: 'TITLE', message: 'Welcome!' },
    { name: 'FOOTER_TXT', message: 'Not a user yet?' },
    { name: 'FOOTER_LINK', message: 'Create an account' },
    { name: 'SUB_FOOTER_LINK', message: 'Forgot password?' }
  ],

  properties: [
    {
      class: 'DAO',
      name: 'dao_',
      documentation: `The dao that will be used to save the new user.`,
      factory: function() {
        return this.signUpDAO;
      },
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
      name: 'signUpToken_',
      hidden: true
    }
  ],

  methods: [
    {
      name: 'footerLink',
      code: function() {
        this.stack.push({ class: 'foam.u2.view.LoginView', model: foam.core.SignUp.create() });
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
  ],

  actions: [
    {
      name: 'login',
      label: 'Sign in',
      code: function(X) {
        this.auth.loginByEmail(X, this.email, this.password).then(
          (usr) => {
            if ( ! usr ) return;
            usr.signUpToken = this.signUpToken_;
            this.dao_.put(usr).then((ussr)=>{
              this.user.copyFrom(ussr);
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
                  window.localStorage.setItem('setOnboardingWizardPush', true);
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
