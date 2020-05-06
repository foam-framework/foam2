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
    'notify',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User'
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'FOOTER_TXT', message: 'Already have an account?' },
    { name: 'FOOTER_LINK', message: 'Sign in' }
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
      class: 'Boolean',
      name: 'disableCompanyName_',
      documentation: `Set this to true to disable the Company Name input field.`,
      hidden: true
    },
    {
      class: 'StringArray',
      name: 'countryChoices_',
      documentation: `Set this to the list of countries (Country.NAME) we want our signing up user to be able to select.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'firstName',
      gridColumns: 6,
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Jane'
      },
      required: true
    },
    {
      class: 'String',
      name: 'lastName',
      gridColumns: 6,
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Doe'
      },
      required: true
    },
    {
      class: 'String',
      name: 'jobTitle',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceWithOtherView',
          otherKey: 'Other',
          choiceView: {
            class: 'foam.u2.view.ChoiceView',
            placeholder: 'Please select...',
            dao: X.jobTitleDAO,
            objToChoice: function(a) {
              return [a.name, a.label];
            }
          }
        };
      },
      validationPredicates: [
        {
          args: ['jobTitle'],
          predicateFactory: function(e) {
            return e.NEQ(foam.nanos.u2.navigation.SignUp.JOB_TITLE, '');
          },
          errorString: 'Please enter job title'
        }
      ],
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'phone',
      required: true
    },
    {
      class: 'String',
      name: 'organization',
      label: 'Company Name',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'ABC Company'
      },
      visibility: function(disableCompanyName_) {
        return disableCompanyName_ ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      required: true
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      label: 'Country',
      of: 'foam.nanos.auth.Country',
      documentation: 'Country address.',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        choices = X.data.slot(function(countryChoices_) {
          if ( ! countryChoices_ || countryChoices_.length == 0 ) return X.countryDAO;
          return X.countryDAO.where(E.IN(X.data.Country.ID, countryChoices_));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: 'Select your country',
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          dao$: choices
        }, X);
      },
      required: true,
    },
    {
      class: 'String',
      name: 'userName',
      label: 'Username',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'example123'
      },
      //TODO: uncomment when integrating
      // validationPredicates: [
      //   {
      //     args: ['userName'],
      //     predicateFactory: function(e) {
      //       return e.REG_EXP(
      //         foam.nanos.u2.navigation.SignUp.USER_NAME,
      //         /^[^\s\/]+$/);
      //     },
      //     errorString: 'Please enter username'
      //   }
      // ],
      //TODO: set to true when integrating
      required: false,
      //TODO: set to false when integrating
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
            firstName: this.firstName,
            lastName: this.lastName,
            organization: this.organization,
            userName: this.userName,
            email: this.email,
            desiredPassword: this.desiredPassword,
            signUpToken: this.token_,
            address: this.Address.create({ countryId: this.countryId }),
            welcomeEmailSent: true,
            jobTitle: this.jobTitle,
            phone: this.Phone.create({ number: this.phone }),
            group: this.group_
          }))
          .then((user) => {
            this.user.copyFrom(user);
            this.updateUser(x);
          }).catch((err) => {
            this.notify(err.message || 'There was a problem creating your account.', 'error');
          })
          .finally(() => {
            this.isLoading_ = false;
          });
      }
    }
  ]
});
