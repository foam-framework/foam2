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

  documentation: '',

  tableColumns: [
    'id', 'type', 'group', 'spid', 'firstName', 'lastName', 'organization', 'email'
  ],

  // TODO: The following properties don't have to be defined here anymore once
  // https://github.com/foam-framework/foam2/issues/1529 is fixed:
  //   1. created
  //   2. firstName
  //   3. middleName
  //   4. lastName
  //   5. legalName
  //   6. lastModified
  properties: [
    {
      class: 'Long',
      name: 'id',
      final: true,
      tableWidth: 45
    },
    {
      class: 'Boolean',
      name: 'loginEnabled',
      documentation: 'Enables user to login',
      value: true
    },
    {
      class: 'DateTime',
      name: 'lastLogin',
      documentation: 'Date and time user last logged in.'
    },
    'firstName',
    'middleName',
    'lastName',
    'legalName',
    {
      class: 'String',
      name: 'organization',
      documentation: 'Organization/Business the user is accompanied to.',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      validateObj: function(organization) {
        if ( organization.length > 35 ) {
          return 'Organization name cannot exceed 35 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'department',
      documentation: 'Department the user is accompanied to within the organization.',
      width: 50
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      documentation: 'Email address of user.',
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

        if ( ! emailRegex.test(email) ) {
          return 'Invalid email address.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'emailVerified',
      documentation: 'Email verified flag',
      permissionRequired: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      documentation: 'Personal phone number of user.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      documentation: 'Omits properties of phone number object and returns the number.',
      expression: function(phone) {
        return phone.number;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      documentation: 'Mobile phone number of user.',
      factory: function() {
        return this.Phone.create();
      },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'Type of user. (Business, Personal etc.)',
      tableWidth: 91,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Personal', 'Business', 'Merchant', 'Broker', 'Bank', 'Processor' ]
      }
    },
    {
      class: 'Date',
      name: 'birthday',
      documentation: 'User\' birthday.'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      documentation: 'User\' profile picture.',
      view: {
        class: 'foam.nanos.auth.ProfilePictureView',
        placeholderImage: 'images/ic-placeholder.png'
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'User\' Address.',
      factory: function() {
        return this.Address.create();
      },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'Reference',
      name: 'language',
      documentation: 'User\' default language. Can be used to determine displayed language.',
      of: 'foam.nanos.auth.Language',
      value: 'en'
    },
    {
      class: 'String',
      name: 'timeZone',
      documentation: 'User\' preferred timezone.',
      width: 5
      // TODO: create custom view or DAO
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      documentation: 'A password user would like to have during registration process.',
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
      hidden: true,
      networkTransient: true
    },
    {
      class: 'Password',
      name: 'previousPassword',
      hidden: true,
      networkTransient: true
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified',
      documentation: 'Date and time password was last modified.'
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry',
      documentation: 'Date and time password expires.'
    },
    // TODO: startDate, endDate,
    // TODO: do we want to replace 'note' with a simple ticket system?
    {
      class: 'String',
      name: 'note',
      documentation: 'Note appended to user.',
      displayWidth: 70,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 100 }
    },
    // TODO: remove after demo
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Name of business user is accompanied to.',
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
      documentation: 'Bank Identification Code (BIC)'
    },
    {
      class: 'Boolean',
      name: 'businessHoursEnabled',
      documentation: 'Enables business hours.',
      value: false
    },
    {
      class: 'StringArray',
      name: 'disabledTopics',
      documentation: 'disabled types for notifications'
    },
    {
      class: 'StringArray',
      name: 'disabledTopicsEmail',
      documentation: 'disabled types for Email notifications'
    },
    {
      class: 'URL',
      name: 'website',
      documentation: 'User\' website.',
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
      documentation: 'Creation date.'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'Last modified date.'
    },
    {
      class: 'Boolean',
      name: 'system',
      value: false,
      documentation: 'Indicate system accounts.'
    }
  ],

  methods: [
    {
      name: 'label',
      javaReturns: 'String',
      code: function label() {
        return this.organization || ( this.lastName ? this.firstName + ' ' + this.lastName : this.firstName );
      },
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getOrganization()) ) return getOrganization();
        if ( SafetyUtil.isEmpty(getLastName()) ) return getFirstName();
        return getFirstName() + " " + getLastName();
      `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        User user = (User) x.get("user");
        AuthService auth = (AuthService) x.get("auth");

        // Prevent privilege escalation by only allowing a user's group to be
        // set to one that the user doing the put has permission to update.
        boolean hasGroupUpdatePermission = auth.check(x, "group.update." + this.getGroup());
        if ( ! hasGroupUpdatePermission ) {
          throw new AuthorizationException("You do not have permission to set that user's group to '" + this.getGroup() + "'.");
        }

        // Prevent everyone but admins from changing the 'system' property. 
        if ( this.getSystem() && ! user.getGroup().equals("admin") ) {
          throw new AuthorizationException("You do not have permission to change the 'system' flag.");
        }
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
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
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'oldObj', javaType: 'foam.core.FObject' }
      ],
      javaReturns: 'void',
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

        // Prevent everyone but admins from changing the 'system' property. 
        if (
          ! SafetyUtil.equals(oldUser.getSystem(), this.getSystem()) &&
          ! user.getGroup().equals("admin")
        ) {
          throw new AuthorizationException("You do not have permission to change the 'system' flag.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
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
  refines: 'foam.nanos.auth.UserUserJunction',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group'
    }
  ]
});
