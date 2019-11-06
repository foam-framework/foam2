foam.CLASS({
  package: 'foam.core',
  name: 'SignUp',

  documentation: `Model used for registering/creating an user.`,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'acceptanceDocumentService',
    'auth',
    'notify',
    'smeBusinessRegistrationDAO',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.Element',
    'net.nanopay.ui.NewPasswordView'
  ],

  properties: [
    {
      class: 'DAO',
      name: 'dao_',
      documentation: `The dao that will be used to save the new user.`,
      factory: function() {
        return userDAO;
      },
      hidden: true
    },
    {
      class: 'String',
      name: 'group_',
      documentation: `Group this user is going to be apart of.`,
      factory: function() {
        return 'system';
      },
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
      name: 'department',
      label: 'Your Job Title',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Staff accountant'
      },
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      label: 'Phone Number',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' },
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
      visibilityExpression: function(disableCompanyName_) {
        return disableCompanyName_ ? foam.u2.Visibility.DISABLED : foam.u2.Visibility.RW;
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
        var choices = X.data.slot(function() {
          return X.countryDAO.where(X.data.EQ(X.data.Country.NAME, 'Canada'));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: 'Select your country',
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          dao$: choices
        });
      },
      required: true,
    },
    {
      class: 'EMail',
      name: 'email',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'example@example.com'
      },
      visibilityExpression: function(disableEmail_) {
        return disableEmail_ ?
          foam.u2.Visibility.DISABLED : foam.u2.Visibility.RW;
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
      required: true
    }
  ],

  methods: [
    {
      name: 'updateUser',
      documentation: 'update user ',
      code: function(x, userId) {
        this.isLoading_ = true;
        this.auth
          .loginByEmail(null, this.email, this.desiredPassword)
          .then((user) => {
            this.user.copyFrom(user);
              if ( this.user.emailVerified ) {
                // When a link was sent to user to SignUp, they will have already verified thier email,
                // thus thier user.emailVerified should be true and they can simply login from here.
                window.history.replaceState(null, null, window.location.origin);
                location.reload();
              } else {
                // logout once we have finished updating documents.
                this.auth.logout();
                this.stack.push({
                  class: 'foam.nanos.auth.ResendVerificationEmail'
                });
              }
              this.isLoading_ = false;
          })
          .catch((err) => {
            console.warn(err.message);
            this.notify('There was a problem while signing you in.', 'error');
          });
      }
    }
  ],

  actions: [
    {
      name: 'CreateNew',
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
            email: this.email,
            desiredPassword: this.desiredPassword,
            signUpToken: this.token_,
            address: this.Address.create({ countryId: this.countryId }),
            welcomeEmailSent: true,
            department: this.department,
            phone: this.phone,
            group: this.group_
          }))
          .then((user) => {
            this.user.copyFrom(user);
            this.updateUser(x, this.user.id);
          }).catch((err) => {
            console.warn(err.message);
            this.notify('There was a problem creating your account.', 'error');
          })
          .finally(() => {
            this.isLoading_ = false;
          });
      }
    }

  ]
});
