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
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.PriorPassword',
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
    'foam.nanos.auth.PriorPassword',
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

  constants: [
    {
      name: 'SYSTEM_USER_ID',
      value: 1,
      type: 'Long'
    }
  ],

  sections: [
    {
      name: 'business',
      title: 'Business Information'
    },
    {
      name: 'personal',
      title: 'Personal Information'
    },
    {
      name: 'administrative',
      help: 'Properties that are used internally by the system.',
      permissionRequired: true
    },
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
      tableWidth: 50,
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether the User is permitted certain actions.',
      value: true,
      section: 'administrative'
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the User can login to the platform.',
      writePermissionRequired: true,
      value: true,
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'lastLogin',
      documentation: 'The date and time of last login by User.',
      section: 'administrative',
      createMode: 'HIDDEN',
      updateMode: 'RO'
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'The first name of the User.',
      // TODO: Use validatationPredicates instead.
      validateObj: function(firstName) {
        if ( ! firstName.trim() ) {
          return 'First Name Required.';
        }
      },
      gridColumns: 4,
      section: 'personal'
    },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The middle name of the User.',
      gridColumns: 4,
      section: 'personal'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'The last name of the User.',
      // TODO: Use validatationPredicates instead.
      validateObj: function(lastName) {
        if ( ! lastName.trim() ) {
          return 'Last Name Required.';
        }
      },
      gridColumns: 4,
      section: 'personal'
    },
    {
      name: 'legalName',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'personal'
    },
    {
      class: 'String',
      name: 'organization',
      documentation: 'The organization/business associated with the User.',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      // TODO: Use validatationPredicates instead.
      validateObj: function(organization) {
        if ( ! organization.trim() ) {
          return 'Organization Required.';
        }
      },
      section: 'business'
    },
    {
      class: 'String',
      name: 'department',
      documentation: `The department associated with the organization/business
        of the User.`,
      width: 50,
      section: 'business'
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
      // TODO: Use validatationPredicates instead.
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! email.trim() ) {
          return 'Email Required.';
        }

        if ( ! emailRegex.test(email.trim()) ) {
          return 'Invalid email address.';
        }
      },
      section: 'personal'
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      documentation: 'Determines whether the email address of the User is valid.',
      writePermissionRequired: true,
      section: 'administrative'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: 'Personal phone number.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      section: 'personal'
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      documentation: `Omits properties of the phone number object and returns
        the phone number.`,
      expression: function(phone) {
        return phone.number;
      },
      section: 'personal'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      documentation: 'Returns the mobile phone number of the User from the Phone model.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      section: 'personal'
    },
    {
      class: 'String',
      name: 'type',
      visibility: 'RO',
      storageTransient: true,
      documentation: 'The type of the User.',
      tableWidth: 75,
      getter: function() {
        return this.cls_.name;
      },
      javaGetter: `
        return getClass().getSimpleName();
      `,
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    },
    {
      class: 'Date',
      name: 'birthday',
      documentation: 'The date of birth of the individual person, or real user.',
      section: 'personal'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: `The profile picture of the individual user, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      },
      section: 'personal'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Returns the postal address from the Address model.',
      factory: function() {
        return this.Address.create();
      },
      section: 'personal'
    },
    {
      class: 'Reference',
      name: 'language',
      documentation: 'The default language preferred by the User.',
      of: 'foam.nanos.auth.Language',
      value: 'en',
      section: 'personal'
    },
    {
      class: 'String',
      name: 'timeZone',
      documentation: 'The preferred time zone of the User.',
      width: 5,
      section: 'personal'
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
      },
      section: 'administrative'
    },
    {
      class: 'Password',
      name: 'password',
      documentation: 'The password that is currently active with the User.',
      hidden: true,
      networkTransient: true,
      section: 'administrative'
    },
    {
      name: 'passwordHistory',
      class: 'FObjectArray',
      of: 'foam.nanos.auth.PriorPassword',
      javaFactory: `
        foam.nanos.auth.PriorPassword[] priorPasswords = new foam.nanos.auth.PriorPassword[1];
        priorPasswords[0] = new foam.nanos.auth.PriorPassword();
        priorPasswords[0].setPassword(this.getPassword());
        priorPasswords[0].setTimeStamp(new Date());
        return priorPasswords;
      `,
      hidden: true,
      networkTransient: true,
      section: 'administrative',
      createMode: 'HIDDEN',
      updateMode: 'RO'
    },
    {
      class: 'Password',
      name: 'previousPassword',
      documentation: 'The password that was previously active with the User.',
      hidden: true,
      networkTransient: true,
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      documentation: 'The date and time that the password was last modified.',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      documentation: `The date and time that the current password of the User
        will expire.`,
      section: 'administrative'
    },
    // TODO: startDate, endDate,
    // TODO: do we want to replace 'note' with a simple ticket system?
    {
      class: 'String',
      name: 'note',
      documentation: 'A field for a note that can be added and appended to the User.',
      displayWidth: 70,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 100 },
      section: 'administrative'
    },
    // TODO: remove after demo
    {
      class: 'String',
      name: 'businessName',
      documentation: 'The name of the business associated with the User.',
      width: 50,
      section: 'business',
      hidden: true
    },
    {
      class: 'StringArray',
      name: 'disabledTopics',
      documentation: 'Disables types for notifications.',
      createMode: 'HIDDEN',
      section: 'administrative'
    },
    {
      class: 'StringArray',
      name: 'disabledTopicsEmail',
      documentation: 'Disables types for email notifications.',
      createMode: 'HIDDEN',
      section: 'administrative'
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
      },
      section: 'personal'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the User was created in the system.',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time the User was last modified.',
      createMode: 'HIDDEN',
      updateMode: 'RO',
      section: 'administrative'
    }
  ],

  methods: [
    {
      name: 'label',
      type: 'String',
      code: function label() {
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return '';
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return "";
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
    },
    {
      name: 'toSummary',
      code: function() {
        return this.label();
      }
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
    hidden: false,
    section: 'administrative'
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
    tableWidth: 120,
    section: 'administrative'
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
  sourceProperty: {
    createMode: 'HIDDEN',
    section: 'business'
  },
  targetProperty: {
    createMode: 'HIDDEN',
    section: 'business'
  }
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
