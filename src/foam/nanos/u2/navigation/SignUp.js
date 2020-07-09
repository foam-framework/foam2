/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SignUp',

  documentation: `Model used for registering/creating an user.
  Hidden properties create the different functionalities for this view (Ex. coming in with a signUp token)`,

  imports: [
    'appConfig',
    'auth',
    'ctrl',
    'stack',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'FOOTER_TXT', message: 'Already have an account?' },
    { name: 'FOOTER_LINK', message: 'Sign in' },
    { name: 'ERROR_MSG', message: 'There was a problem creating your account.' },
    { name: 'VALIDATION_ERR_TEXT', message: 'Please enter username' }
  ],

  properties: [
    {
      name: 'dao_',
      hidden: true
    },
    {
      class: 'String',
      name: 'group_',
      documentation: `Group this user is going to be apart of.`,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isLoading_',
      documentation: `Condition to synchronize code execution and user response.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'token_',
      documentation: `Input to associate new user with something.`,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'disableEmail_',
      documentation: `Set this to true to disable the email input field.`,
      hidden: true
    },
    {
      class: 'EMail',
      name: 'email',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'example@example.com'
      },
      visibility: function(disableEmail_) {
        return disableEmail_ ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      required: true
    },
    {
      class: 'String',
      name: 'userName',
      label: 'Username',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'example123'
      },
      validationPredicates: [
        {
          args: ['userName'],
          predicateFactory: function(e) {
            return e.REG_EXP(
              foam.nanos.u2.navigation.SignUp.USER_NAME,
              /^[^\s\/]+$/);
          },
          errorMessage: 'VALIDATION_ERR_TEXT'
        }
      ],
      required: true
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      minLength: 6
    }
  ],

  methods: [
    {
      name: 'footerLink',
      code: function(topBarShow_, param) {
        window.history.replaceState(null, null, window.location.origin);
        this.stack.push({ class: 'foam.u2.view.LoginView', mode_: 'SignIn', topBarShow_: topBarShow_, param: param }, this);
      }
    },
    {
      name: 'subfooterLink',
      code: function() {
        return;
      }
    },
    {
      name: 'updateUser',
      code: function(x) {
        this.finalRedirectionCall();
      }
    },
    {
      name: 'finalRedirectionCall',
      code: function() {
        if ( this.user.emailVerified ) {
          // When a link was sent to user to SignUp, they will have already verified thier email,
          // thus thier user.emailVerified should be true and they can simply login from here.
          window.history.replaceState(null, null, window.location.origin);
          location.reload();
        } else {
          this.stack.push({
            class: 'foam.nanos.auth.ResendVerificationEmail'
          });
        }
      }
    }
  ],

  actions: [
    {
      name: 'login',
      label: 'Get Started',
      isEnabled: function(errors_, isLoading_) {
        return ! errors_ && ! isLoading_;
      },
      code: function(x) {
        this.isLoading_ = true;
        this.dao_
          .put(this.User.create({
            // organization needs to be overwritten by crunch when registering business
            organization: this.userName,
            userName: this.userName,
            email: this.email,
            desiredPassword: this.desiredPassword,
            signUpToken: this.token_,
            group: this.group_
          }))
          .then((user) => {
            this.user.copyFrom(user);
            this.updateUser(x);
          }).catch((err) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: err.message || this.ERROR_MSG,
              type: this.LogLevel.ERROR
            }));
          })
          .finally(() => {
            this.isLoading_ = false;
          });
      }
    }
  ]
});
