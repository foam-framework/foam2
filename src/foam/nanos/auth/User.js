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
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.HumanNameTrait',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.notification.Notifiable'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.PriorPassword'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.LifecycleAware',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.notification.NotificationSetting',
    'foam.nanos.session.Session',
    'foam.nanos.theme.Theme',
    'foam.util.SafetyUtil',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.List',
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
    'group.id',
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
      name: 'userInformation',
      title: 'User Information',
      order: 1
    },
    {
      name: 'businessInformation',
      title: 'Business Information',
      order: 2
    },
    {
      name: 'ownerInformation',
      title: 'Ownership'
    },
    {
      name: 'operationsInformation',
      title: 'Operations'
    },
    {
      name: 'complianceInformation',
      title: 'Compliance'
    },
    {
      name: 'accountInformation',
      title: 'Accounts'
    },
    {
      name: 'contactInformation',
      title: 'Contacts'
    },
    {
      name: 'systemInformation',
      help: 'Properties that are used internally by the system.',
      title: 'System Information',
      permissionRequired: true
    },
    {
      name: 'deprecatedInformation',
      title: 'Deprecated',
      permissionRequired: true
    }
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
      tableWidth: 100,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      order: 10,
      gridColumns: 6,
      includeInDigest: true,
      sheetsOutput: true
    },
    {
      class: 'String',
      name: 'userName',
      label: 'Username',
      includeInDigest: true,
      containsPII: false,
      documentation: 'The username of the User.',
      section: 'userInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Determines whether the User can login to the platform.',
      writePermissionRequired: true,
      includeInDigest: false,
      value: true,
      section: 'userInformation',
      order: 30,
      gridColumns: 6,
    },
    {
      class: 'DateTime',
      name: 'lastLogin',
      includeInDigest: false,
      documentation: 'The date and time of last login by User.',
      section: 'userInformation',
      order: 40,
      gridColumns: 6,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      includeInDigest: false,
      documentation: `The date and time that the current password of the User
        will expire.`,
      section: 'userInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      includeInDigest: false,
      documentation: 'The date and time that the password was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'firstName',
      shortName: 'fn',
      documentation: 'The first name of the User.',      
      section: 'userInformation',
      order: 70,
      gridColumns: 6,
      includeInDigest: true,
      containsPII: true
   },
    {
      class: 'String',
      name: 'middleName',
      documentation: 'The middle name of the User.',
      section: 'userInformation',
      order: 80,
      gridColumns: 6,
      includeInDigest: true,
      containsPII: true
    },
    {
      class: 'String',
      name: 'lastName',
      shortName: 'ln',
      documentation: 'The last name of the User.',
      section: 'userInformation',
      order: 90,
      gridColumns: 6,
      includeInDigest: true,
      containsPII: true
    },
    {
      name: 'legalName',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      order: 100,
      gridColumns: 6,
      includeInDigest: false,
      containsPII: true
    },
    {
      class: 'Date',
      name: 'birthday',
      includeInDigest: false,
      containsPII: false,
      documentation: 'The date of birth of the individual person, or real user.',
      section: 'userInformation',
      order: 120,
      gridColumns: 6
    },
    {
      class: 'Reference',
      name: 'language',
      includeInDigest: false,
      containsPII: false,
      documentation: 'The default language preferred by the User.',
      of: 'foam.nanos.auth.Language',
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 130,
      gridColumns: 6,
      factory: function() {
        return foam.nanos.auth.LanguageId.create({code: 'en'})
      },
      javaFactory: `
        return new foam.nanos.auth.LanguageId.Builder(null).setCode("en").build();
      `
    },
    {
      class: 'String',
      name: 'timeZone',
      includeInDigest: false,
      documentation: 'The preferred time zone of the User.',
      width: 5,
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 140,
      gridColumns: 6
    },
    {
      class: 'EMail',
      name: 'email',
      label: {
        'en' :'Email Address',
        'fr' :'Adresse e-mail'
      },
      includeInDigest: true,
      containsPII: true,
      documentation: 'The email address of the User.',
      displayWidth: 80,
      width: 100,
      javaSetter:
      `email_ = val.toLowerCase();
       emailIsSet_ = true;`,
      section: 'userInformation',
      order: 150,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      includeInDigest: false,
      documentation: 'Determines whether the email address of the User is valid.',
      writePermissionRequired: true,
      section: 'userInformation',
      order: 160,
      gridColumns: 6
    },
    {
      class: 'URL',
      name: 'website',
      includeInDigest: false,
      documentation: 'A URL link to the website of the User.',
      displayWidth: 80,
      width: 2048,
      validateObj: function(website) {
        var websiteRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;

        if ( website.length > 0 && ! websiteRegex.test(website) ) {
          return 'Invalid website';
        }
      },
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 170,
      gridColumns: 6
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Returns the postal address from the Address model.',
      includeInDigest: false,
      containsPII: true,
      factory: function() {
        return this.Address.create();
      },
      section: 'userInformation',
      order: 180
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber',
      includeInDigest: false,
      containsPII: true,
      documentation: 'Personal phone number.',
      section: 'userInformation',
      order: 190,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'phoneNumberVerified',
      includeInDigest: false,
      writePermissionRequired: true,
      section: 'userInformation',
      order: 200,
      gridColumns: 6
    },
    {
      class: 'PhoneNumber',
      name: 'mobileNumber',
      includeInDigest: false,
      documentation: 'Returns the mobile phone number of the User from the Phone model.',
      createVisibility: 'HIDDEN',
      section: 'userInformation',
      order: 210,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'mobileNumberVerified',
      includeInDigest: false,
      writePermissionRequired: true,
      section: 'userInformation',
      order: 220,
      gridColumns: 6
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      includeInDigest: false,
      containsPII: true,
      documentation: `The profile picture of the individual user, initially
        defaulting to a placeholder picture.`,
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      },
      section: 'userInformation',
      order: 230,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'note',
      documentation: 'A field for a note that can be added and appended to the User.',
      displayWidth: 70,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 100 },
      section: 'userInformation',
      order: 240
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      documentation: 'The date and time of when the User was created in the system.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'userInformation',
      order: 250,
      gridColumns: 6,
      includeInDigest: true
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: true,
      documentation: 'The date and time the User was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      storageOptional: true,
      section: 'userInformation',
      order: 260,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'organization',
      includeInDigest: false,
      containsPII: false,
      documentation: 'The organization/business associated with the User.',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      section: 'businessInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'businessName',
      includeInDigest: false,
      documentation: 'The name of the business associated with the User.',
      width: 50,
      section: 'businessInformation',
      order: 15,
      gridColumns: 6,
      tableWidth: 170
    },
    {
      class: 'String',
      name: 'department',
      includeInDigest: false,
      containsPII: false,
      documentation: `The department associated with the organization/business
        of the User.`,
      width: 50,
      createVisibility: 'HIDDEN',
      section: 'businessInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'jobTitle',
      includeInDigest: false,
      containsPII: false,
      documentation: 'The job title of the individual person, or real user.',
      section: 'businessInformation',
      order: 30,
      gridColumns: 6,
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
      }
    },
    {
      class: 'StringArray',
      name: 'disabledTopics',
      includeInDigest: false,
      documentation: 'Disables types for notifications.',
      createVisibility: 'HIDDEN',
      section: 'operationsInformation',
      order: 80,
      gridColumns: 6,
      javaPostSet: `
        clearDisabledTopicSet();
      `
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.auth.LifecycleState',
      name: 'lifecycleState',
      includeInDigest: true,
      section: 'systemInformation',
      order: 40,
      gridColumns: 6,
      value: foam.nanos.auth.LifecycleState.PENDING,
      writePermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      tableWidth: 120,
      section: 'systemInformation',
      order: 50,
      gridColumns: 6,
      writePermissionRequired:true,
      documentation: `
        Need to override getter to return "" because its trying to
        return null (probably as a result of moving order of files
        in nanos), which breaks tests
      `,
      javaGetter: `
        if ( ! spidIsSet_ ) {
          return "";
        }
        return spid_;
      `
    },
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether the User is permitted certain actions.',
      value: true,
      includeInDigest: true,
      section: 'systemInformation',
      order: 90,
      gridColumns: 6
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
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'systemInformation',
      order: 100,
      gridColumns: 6
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
      createVisibility: 'RW',
      updateVisibility: 'RW',
      readVisibility: 'HIDDEN',
      section: 'systemInformation',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'Password',
      name: 'password',
      includeInDigest: true,
      documentation: 'The password that is currently active with the User.',
      hidden: true,
      networkTransient: true
    },
    {
      class: 'Password',
      name: 'previousPassword',
      includeInDigest: false,
      documentation: 'The password that was previously active with the User.',
      hidden: true,
      networkTransient: true,
      section: 'systemInformation',
      order: 120
    },
    {
      name: 'passwordHistory',
      class: 'FObjectArray',
      of: 'foam.nanos.auth.PriorPassword',
      includeInDigest: false,
      javaFactory: `
        foam.nanos.auth.PriorPassword[] priorPasswords = new foam.nanos.auth.PriorPassword[1];
        priorPasswords[0] = new foam.nanos.auth.PriorPassword();
        priorPasswords[0].setPassword(this.getPassword());
        priorPasswords[0].setTimeStamp(new java.util.Date());
        return priorPasswords;
      `,
      hidden: true,
      networkTransient: true,
      createVisibility: 'HIDDEN',
      section: 'systemInformation',
      order: 130,
      updateVisibility: 'RO'
    },
    {
      class: 'Object',
      /** @private */
      name: 'disabledTopicSet',
      javaType: 'java.util.HashSet',
      hidden: true,
      transient: true,
      factory: function() { return {}; },
      javaFactory: `
        HashSet<String> set = new HashSet<>();
        for ( String s : getDisabledTopics() ) {
          set.add(s);
        }
        return set;
      `
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function toSummary() {
        if ( this.legalName ) return this.legalName;
        if ( this.lastName && this.firstName ) return this.firstName + ' ' + this.lastName;
        if ( this.lastName ) return this.lastName;
        if ( this.firstName ) return this.firstName;
        return this.userName;
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(this.getLegalName()) ) return this.getLegalName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) && ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName() + " " + this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getLastName()) ) return this.getLastName();
        if ( ! SafetyUtil.isEmpty(this.getFirstName()) ) return this.getFirstName();
        return this.getUserName();
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
        if ( ! auth.check(x, "group.update." + this.getGroup()) ) {
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
        Subject subject = (Subject) x.get("subject");
        User user = subject.getUser();
        User agent = subject.getRealUser();
        AuthService auth = (AuthService) x.get("auth");
        boolean findSelf = SafetyUtil.equals(this.getId(), user.getId()) ||
          (
            agent != null &&
            SafetyUtil.equals(agent.getId(), this.getId())
          );

        if ( ! findSelf &&
             ! auth.check(x, "user.read." + this.getId())
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
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");
        User oldUser = (User) oldObj;

        Subject subject = (Subject) x.get("subject");
        User agent = subject.getRealUser();
        boolean updatingSelf = SafetyUtil.equals(this.getId(), user.getId()) ||
          (
            agent != null &&
            SafetyUtil.equals(agent.getId(), this.getId())
          );
        boolean hasUserEditPermission = auth.check(x, "user.update." + this.getId());

        if (
          ! updatingSelf &&
          ! hasUserEditPermission &&
          ! auth.check(x, "serviceprovider.update." + user.getSpid())
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
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if (
          ! SafetyUtil.equals(this.getId(), user.getId()) &&
          ! auth.check(x, "user.remove." + this.getId()) &&
          ! auth.check(x, "serviceprovider.remove." + this.getSpid())
        ) {
          throw new RuntimeException("You do not have permission to delete that user.");
        }
      `
    },
    {
      name: 'doNotify',
      javaCode: `
        // Get the default settings for the user if none are already defined
        List<NotificationSetting> settingDefaults = ((ArraySink) ((DAO) x.get("notificationSettingDefaultsDAO"))
          .where(EQ(foam.nanos.notification.NotificationSetting.SPID, getSpid()))
          .select(new ArraySink()))
          .getArray();
        HashMap<String, NotificationSetting> settingsMap = new HashMap<String, NotificationSetting>();
        for ( NotificationSetting setting : settingDefaults ) {
          settingsMap.put(setting.getClassInfo().getId(), setting);
        }

        // Get the configured notifications settings for the user and overwrite the defaults
        List<NotificationSetting> settings = ((ArraySink) getNotificationSettings(x).select(new ArraySink())).getArray();
        for ( NotificationSetting setting : settings ) {
          settingsMap.put(setting.getClassInfo().getId(), setting);
        }

        for ( NotificationSetting setting : settingsMap.values() ) {
          setting.doNotify(x, this, notification);
        }
      `
    },
    {
      name: 'validateAuth',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `

        // check if user enabled
        if ( ! this.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user login enabled
        if ( ! this.getLoginEnabled() ) {
          throw new AuthenticationException("Login disabled");
        }

        // fetch context from session and check two factor success if enabled.
        Session session = x.get(Session.class);
        if ( session == null ) {
          throw new AuthenticationException("No session exists.");
        }

        // check for two-factor authentication
        if ( this.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
          throw new AuthenticationException("User requires two-factor authentication");
        }

        if ( this instanceof LifecycleAware && ((LifecycleAware) this).getLifecycleState() != LifecycleState.ACTIVE ) {
          throw new AuthenticationException("User is not active");
        }
      `
    },
    {
      name: 'isAdmin',
      type: 'Boolean',
      documentation: `
        Returns true if the user has the system user id, or is in either the
        admin or system group.

        **IMPORTANT**: It is possible to misuse the value from this method.
        A check on this method should never be used to override behaviour of
        authorization; in this case it is preferred to create a permission that
        no other user will have.
      `,
      javaCode: `
        return getId() == foam.nanos.auth.User.SYSTEM_USER_ID
          || getGroup().equals("admin")
          || getGroup().equals("system");
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
    hidden: false,
    section: 'administrative',
    order: 30,
    gridColumns: 6
  }
});


foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.auth.User',
  targetModel: 'foam.nanos.fs.File',
  forwardName: 'files',
  inverseName: 'owner',
  sourceProperty: {
    transient: true,
    section: 'systemInformation'
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
    createVisibility: 'HIDDEN',
    label: 'Businesses',
    section: 'businessInformation',
    order: 50
  },
  targetProperty: {
    createVisibility: 'HIDDEN',
    label: 'Agents of Business',
    section: 'businessInformation',
    order: 40
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

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.theme.Theme',
  targetModel: 'foam.nanos.auth.User',
  cardinality: '1:*',
  forwardName: 'users',
  inverseName: 'theme',
  sourceProperty: {
    hidden: true,
    visibility: 'HIDDEN',
  },
  targetProperty: {
    section: 'systemInformation',
    order: 60,
    gridColumns: 6
  }
});
