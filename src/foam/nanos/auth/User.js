/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'User',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.HumanNameTrait',
    'foam.nanos.auth.LastModifiedAware'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthService',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ'
  ],

  documentation: `The User represents a person or entity with the ability 
    to use a username and password to log into and use the system as well 
    as act on behalf of a business, if permissions are granted. It holds 
    personal information and permits certain actions.  In this documentation, 
    the term 'real user' refers exclusively to an individual person.
  `,

  tableColumns: [
    'id',
    'type',
    'group',
    'legalName',
    'organization',
    'email'
  ],

  searchColumns: [
    'id',
    'type',
    'spid',
    'group',
    'enabled',
    'firstName',
    'lastName',
    'organization',
    'email'
  ],

  // TODO: The following properties don't have to be defined here anymore once
  // https://github.com/foam-framework/foam2/issues/1529 is fixed:
  //   1. enabled
  //   2. created
  //   3. firstName
  //   4. middleName
  //   5. lastName
  //   6. legalName
  //   7. lastModified
  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'The ID for the User.',
      final: true,
      tableWidth: 50
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Verifies that the User is permitted certain actions.',
      value: true
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Verifies that the User can login to the platform.',
      value: true
    },
    {
      class: 'DateTime',
      name: 'lastLogin',
      documentation: 'The date and time of last login by User.'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The first name of the User.',
      validateObj: function(firstName) {
        if ( ! firstName.trim() ){
          return 'First Name Required.'
        } if ( firstName.length > 70 ) {
          return 'First name cannot exceed 70 characters.';
        } if( /\d/.test(this.firstName) ) {
          return 'First name cannot contain numbers';
        } 
      }
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The middle name of the User.'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'The last name of the User.',
      validateObj: function(lastName) {
        if ( ! lastName.trim() ){
          return 'Last Name Required.'
        } if ( lastName.length > 70 ) {
          return 'Last name cannot exceed 70 characters.';
        } if( /\d/.test(this.lastName) ) {
          return 'Last name cannot contain numbers';
        } 
      }
    },
    'legalName',
    {
      class: 'String',
      name: 'organization',
      documentation: 'The organization/business associated with the User.',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      validateObj: function(organization) {
        if ( organization.length > 70 ) {
          return 'Company name cannot exceed 70 characters.';
        } if (!(organization.trim())) {
          return 'Company Name Required.';
        }
      }
    },
    {
      class: 'String',
      name: 'department',
      documentation: `The department associated with the organization/business 
        of the User.`,
      width: 50
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'The email address of the User.',
      displayWidth: 80,
      width: 100,
      preSet: function(_, val) {
        return val.toLowerCase();
      },
      javaSetter:
      `email_ = val.toLowerCase();
       emailIsSet_ = true;`,
      validateObj: function (email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        if (!(email.trim())) {
          return 'Email Required.';
        }
        if ( ! emailRegex.test(email.trim()) ) {
          return 'Invalid email address.';
        } 
      }
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      documentation: 'Verifies that the email address of the User is valid.',
      permissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: 'Returns the personal phone number of the User from the Phone model.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      documentation: `Omits properties of the phone number object and returns 
        the phone number.`,
      expression: function(phone) {
        return phone.number;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      documentation: 'Returns the mobile phone number of the User from the Phone model.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of the User.',
      tableWidth: 91,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Personal', 'Business', 'Merchant', 'Broker', 'Bank', 'Processor' ]
      }
    },
    {
      class: 'Date',
      name: 'birthday',
      documentation: 'The date of birth of the individual person, or real user.'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: `The profile picture of the individual user, initially 
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Returns the postal address from the Address model.',
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'Reference',
      name: 'language',
      documentation: 'The default language preferred by the User.',
      of: 'foam.nanos.auth.Language',
      value: 'en'
    },
    {
      class: 'String',
      name: 'timeZone',
      documentation: 'The preferred time zone of the User.',
      width: 5
      // TODO: create custom view or DAO
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      documentation: `The password that the individual person, or real user, 
        chooses to be used as a password but may or may not pass as valid.`,
      displayWidth: 30,
      width: 100,
      storageTransient: true,
      validateObj: function (password) {
        var re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{7,32}$/;

        if ( password.length > 0 && ! re.test(password) ) {
          return 'Password must contain one lowercase letter, one uppercase letter, one digit, and be between 7 and 32 characters in length.';
        }
      }
    },
    {
      class: 'Password',
      name: 'password',
      documentation: 'The password that is currently active with the User.',
      hidden: true,
      networkTransient: true
    },
    {
      class: 'Password',
      name: 'previousPassword',
      documentation: 'The password that was previously active with the User.',
      hidden: true,
      networkTransient: true
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      documentation: 'The date and time that the password was last modified.'
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      documentation: `The date and time that the current password of the User 
        will expire.`,
    },
    // TODO: startDate, endDate,
    // TODO: do we want to replace 'note' with a simple ticket system?
    {
      class: 'String',
      name: 'note',
      documentation: 'A field for a note that can be added and appended to the User.',
      displayWidth: 70,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 100 }
    },
    // TODO: remove after demo
    {
      class: 'String',
      name: 'businessName',
      documentation: 'The name of the business associated with the User.',
      width: 50,
      validateObj: function(businessName) {
        if ( businessName.length > 35 ) {
          return 'Business name cannot be greater than 35 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'bankIdentificationCode',
      width: 20,
      documentation: `The Bank Identification Code (BIC): an international bank code that 
      identifies particular banks worldwide.
      `,
    },
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      documentation: 'Verifies that business hours are enabled for the User to set.',
      value: false
    },
    {
      class: 'StringArray',
      name: 'disabledTopics',
      documentation: 'Disables types for notifications.'
    },
    {
      class: 'StringArray',
      name: 'disabledTopicsEmail',
      documentation: 'Disables types for email notifications.'
    },
    {
      class: 'URL',
      name: 'website',
      documentation: 'A URL link to the website of the User.',
      displayWidth: 80,
      width: 2048,
      validateObj: function(website) {
        var websiteRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;

        if ( website.length > 0 && ! websiteRegex.test(website) ) {
          return 'Invalid website';
        }
      }
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the User was created in the system.'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time the User was last modified.'
    }
  ],

  methods: [
    {
      name: 'label',
      type: 'String',
      code: function label() {
        return this.organization || this.businessName || ( this.lastName ? this.firstName + ' ' + this.lastName : this.firstName );
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getOrganization()) ) return getOrganization();
        if ( ! SafetyUtil.isEmpty(getBusinessName()) ) return getBusinessName();
        if ( SafetyUtil.isEmpty(getLastName()) ) return getFirstName();
        return getFirstName() + " " + getLastName();
      `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");

        // Prevent privilege escalation by only allowing a user's group to be
        // set to one that the user doing the put has permission to update.
        boolean hasGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
        if ( ! hasGroupUpdatePermission ) {
          throw new AuthorizationException("You do not have permission to set that user's group to '" + this.getGroup() + "'.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        User agent = (User) x.get("agent");
        AuthService auth = (AuthService) x.get("auth");

        boolean findSelf = SafetyUtil.equals(this.getId(), user.getId()) ||
          (
            agent != null &&
            SafetyUtil.equals(agent.getId(), this.getId())
          );

        if (
          ! findSelf &&
          ! auth.check(x, "user.read." + this.getId()) &&
          ! auth.check(x, "spid.read." + this.getSpid())
        ) {
          throw new AuthorizationException();
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");
        User oldUser = (User) oldObj;

        boolean updatingSelf = SafetyUtil.equals(this.getId(), user.getId()) ||
          (
            x.get("agent") != null &&
            SafetyUtil.equals(((User) x.get("agent")).getId(), this.getId())
          );
        boolean hasUserEditPermission = auth.check(x, "user.update." + this.getId());

        if (
          ! updatingSelf &&
          ! hasUserEditPermission &&
          ! auth.check(x, "spid.update." + user.getSpid())
        ) {
          throw new AuthorizationException("You do not have permission to update this user.");
        }

        // Prevent privilege escalation by only allowing a user's group to be
        // changed under appropriate conditions.
        if ( ! SafetyUtil.equals(oldUser.getGroup(), this.getGroup()) ) {
          boolean hasOldGroupUpdatePermission = auth.check(x, "group.update." + oldUser.getGroup());
          boolean hasNewGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
          if ( updatingSelf ) {
            throw new AuthorizationException("You cannot change your own group.");
          } else if ( ! hasUserEditPermission ) {
            throw new AuthorizationException("You do not have permission to change that user's group.");
          } else if ( ! (hasOldGroupUpdatePermission && hasNewGroupUpdatePermission) ) {
            throw new AuthorizationException("You do not have permission to change that user's group to '" + this.getGroup() + "'.");
          }
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        if (
          ! SafetyUtil.equals(this.getId(), user.getId()) &&
          ! auth.check(x, "user.delete." + this.getId()) &&
          ! auth.check(x, "spid.delete." + this.getSpid())
        ) {
          throw new RuntimeException("You do not have permission to delete that user.");
        }
      `
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.auth.Group',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'users',
  inverseName: 'group',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    hidden: false
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.fs.File',
  forwardName: 'files',
  inverseName: 'owner',
  sourceProperty: {
    hidden: true,
    transient: true
  }
});


foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.auth.ServiceProvider',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'users',
  inverseName: 'spid',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    hidden: false,
    tableWidth: 120
  }
});

// Relationship used in the agent auth service. Determines permission list when acting as a entity.
foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.auth.User',
  forwardName: 'entities',
  inverseName: 'agents',
  junctionDAOKey: 'agentJunctionDAO',
});

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserUserJunctionGroupRefinement',
  refines: 'foam.nanos.auth.UserUserJunction',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group'
    }
  ]
});
