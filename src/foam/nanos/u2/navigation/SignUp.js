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

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'appConfig',
    'auth',
    'ctrl',
    'stack',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'FOOTER_TXT', message: 'Already have an account?' },
    { name: 'FOOTER_LINK', message: 'Sign in' },
    { name: 'ERROR_MSG', message: 'There was a problem creating your account.' },
    { name: 'USERNAME_EMPTY_ERR', message: 'Please enter username' },
    { name: 'USERNAME_SYNTAX_ERR', message: 'Please enter valid username' },
    { name: 'USERNAME_AVAILABILITY_ERR', message: 'This username is taken. Please try another.' }
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
      class: 'Boolean',
      name: 'userNameAvailable',
      documentation: `Binded property used to display failed username availability validation error`,
      value: true,
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      label: 'Username',
      placeholder: 'example123',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.UsernameView',
          icon: 'images/checkmark-small-green.svg',
          onKey: true,
          userNameAvailable$: X.data.userNameAvailable$
        };
      },
      validateObj: function(userName, userNameAvailable) {
        // Empty Check
        if ( userName.length === 0 ) return this.USERNAME_EMPTY_ERR;
        // Syntax Check
        if ( ! /^[^\s\/]+$/.test(userName) ) return this.USERNAME_SYNTAX_ERR;
        // Availability Check
        if ( ! userNameAvailable ) return this.USERNAME_AVAILABILITY_ERR;
      },
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
