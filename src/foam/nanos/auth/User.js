/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'User',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone'
  ],

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  documentation: '',

  tableColumns: [
    'id', 'enabled', 'type', 'group', 'spid', 'firstName', 'lastName', 'organization', 'email'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      max: 999,
      tableWidth: 45
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'DateTime',
      name: 'lastLogin'
    },
    {
      class: 'String',
      name: 'firstName',
      tableWidth: 160,
      validateObj: function (firstName) {
        if ( firstName.length > 70 ) {
          return 'First name cannot exceed 70 characters.';
        }

        if ( /\d/.test(firstName) ) {
          return 'First name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'middleName',
      validateObj: function (middleName) {
        if ( middleName.length > 70 ) {
          return 'Middle name cannot exceed 70 characters.';
        }

        if ( /\d/.test(middleName) ) {
          return 'Middle name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      tableWidth: 160,
      validateObj: function (lastName) {
        if ( lastName.length > 70 ) {
          return 'Last name cannot exceed 70 characters.';
        }

        if ( /\d/.test(lastName) ) {
          return 'Last name cannot contain numbers.';
        }
      }
    },
    {
      class: 'String',
      name: 'legalName',
      transient: true,
      expression: function ( firstName, middleName, lastName ) {
        return middleName != '' ? firstName + ' ' + middleName + ' ' + lastName : firstName + ' ' + lastName;
      }
    },
    {
      class: 'String',
      name: 'organization',
      displayWidth: 80,
      width: 100,
      tableWidth: 160,
      validateObj: function (organization) {
        if ( organization.length > 35 ) {
          return 'Organization name cannot exceed 35 characters.';
        }
      }
    },
    {
      class: 'String',
      name: 'department',
      width: 50
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email Address',
      displayWidth: 80,
      width: 100,
      preSet: function (_, val) {
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
      documentation: 'Email verified flag'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      factory: function () { return this.Phone.create(); },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      transient: true,
      expression: function (phone) {
        return phone.number;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      factory: function () { return this.Phone.create(); },
      view: { class: 'foam.nanos.auth.PhoneDetailView' }
    },
    {
      class: 'String',
      name: 'type',
      tableWidth: 91,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Personal', 'Business', 'Merchant', 'Broker', 'Bank', 'Processor' ]
      }
    },
    {
      class: 'Date',
      name: 'birthday'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      factory: function () { return this.Address.create(); },
      view: { class: 'foam.nanos.auth.AddressDetailView' }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'accounts',
      hidden: true
    },
    {
      class: 'Reference',
      name: 'language',
      of: 'foam.nanos.auth.Language',
      value: 'en'
    },
    {
      class: 'String',
      name: 'timeZone',
      width: 5
      // TODO: create custom view or DAO
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
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
      name: 'passwordLastModified'
    },
    {
      class: 'DateTime',
      name: 'passwordExpiry'
    },
    // TODO: startDate, endDate,
    // TODO: do we want to replace 'note' with a simple ticket system?
    {
      class: 'String',
      name: 'note',
      displayWidth: 70,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 100 }
    },
    // TODO: remove after demo
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Name of the business',
      width: 50,
      validateObj: function (businessName) {
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
      displayWidth: 80,
      width: 2048,
      validateObj: function (website) {
        var websiteRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;

        if ( website.length > 0 && ! websiteRegex.test(website) ) {
          return 'Invalid website';
        }
      }
    },
    {
      class: 'Date',
      name: 'lastModified',
      documentation: 'Last modified date'
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
