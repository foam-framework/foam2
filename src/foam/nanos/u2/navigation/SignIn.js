/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SignIn',

  documentation: `User Signin model to be used with LoginView.
  `,

  imports: [
    'auth',
    'ctrl',
    'loginSuccess',
    'stack',
    'user',
    'menuDAO',
    'memento'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.NotificationMessage'
  ],

  messages: [
    { name: 'TITLE', message: 'Welcome!' },
    { name: 'FOOTER_TXT', message: 'Not a user yet?' },
    { name: 'FOOTER_LINK', message: 'Create an account' },
    { name: 'SUB_FOOTER_LINK', message: 'Forgot password?' },
    { name: 'ERROR_MSG', message: 'There was an issue logging in' },
    { name: 'ERROR_MSG2', message: 'Please enter email or username' }
  ],

  properties: [
    {
      name: 'dao_',
      hidden: true
    },
    {
      class: 'String',
      name: 'identifier',
      required: true,
      label: 'Email or Username',
      view: {
        class: 'foam.u2.TextField',
        focused: true
      },
      visibilityExpression: function(disableIdentifier_) {
        return disableIdentifier_ ?
          foam.u2.Visibility.DISABLED : foam.u2.Visibility.RW;
      },
      validationTextVisible: false
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    },
    {
      class: 'Boolean',
      name: 'disableIdentifier_',
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
          class: 'foam.nanos.auth.ChangePasswordView',
          modelOf: 'foam.nanos.auth.RetrievePassword'
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
            if ( ! this.memento || this.memento.value.length === 0 )
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
      buttonStyle: 'PRIMARY',
      // if you use isAvailable or isEnabled - with model error_, then note that auto validate will not
      // work correctly. Chorme for example will not read a field auto populated without a user action
      code: async function(X) {
        if ( this.identifier.length > 0 ) {
          this.auth.login(X, this.identifier, this.password).then(
            logedInUser => {
              if ( ! logedInUser ) return;
              if ( this.token_ ) {
                logedInUser.signUpToken = this.token_;
                this.dao_.put(logedInUser)
                  .then(updatedUser => {
                    this.user.copyFrom(updatedUser);
                    this.nextStep();
                  }).catch(err => {
                    this.ctrl.add(this.NotificationMessage.create({
                      message: err.message || this.ERROR_MSG,
                      type: this.LogLevel.ERROR
                    }));
                  });
              } else {
                this.user.copyFrom(logedInUser);
                this.nextStep();
              }
            }
          ).catch(
            err => {
              this.ctrl.add(this.NotificationMessage.create({
                message: err.message || this.ERROR_MSG,
                type: this.LogLevel.ERROR
              }));
          });
        } else {
          this.ctrl.add(this.NotificationMessage.create({
            message: this.ERROR_MSG2,
            type: this.LogLevel.ERROR
          }));
        }
      }
    }
  ]
});
