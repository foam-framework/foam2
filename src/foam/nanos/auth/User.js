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

  documentation: '',

  tableColumns: [
    'id', 'enabled', 'firstName', 'lastName', 'organization', 'lastModified'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      max: 999,
      tableWidth: 45
    },
    {
      class: 'String',
      // class: 'SPID',
      label: 'Service Provider',
      name: 'spid',
      documentation: "User's service provider."
    },
    {
      class: 'DateTime',
      name: 'lastLogin'
    },
    {
      class: 'String',
      name: 'firstName',
      tableWidth: 160
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName',
      tableWidth: 160
    },
    {
      class: 'String',
      name: 'organization',
      width: 50,
      tableWidth: 160
    },
    {
      class: 'String',
      name: 'department',
      width: 50
    },
    {
      class: 'EMail',
      name: 'email',
      width: 50,
      preSet: function (_, val) {
        return val.toLowerCase();
      },
      javaSetter:
`email_ = val.toLowerCase();
emailIsSet_ = true;`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      factory: function() { return foam.nanos.auth.Phone.create(); }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      factory: function() { return foam.nanos.auth.Phone.create(); }
    },
    {
      class: 'String',
      name: 'type',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Personal', 'Business', 'Broker', 'Bank' ]
      }
    },
    {
      class: 'Date',
      name: 'birthday'
    },
    {
      class: 'Blob',
      name: 'profilePicture',
      tableCellFormatter: function (value) {
        this.tag({ class: 'foam.u2.view.ImageBlobView' });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      factory: function() { return foam.nanos.auth.Address.create(); }
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
      name: 'password',
      hidden: true,
      displayWidth: 30,
      width: 100
    },
    {
      class: 'Password',
      name: 'previousPassword',
      hidden: true,
      displayWidth: 30,
      width: 100
    },
    {
      class: 'DateTime',
      name: 'passwordLastModified'
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
      width: 50
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      width: 20,
      documentation: 'Business Identification Number (BIN)'
    },
    {
      class: 'String',
      name: 'bankIdentificationCode',
      width: 20,
      documentation: 'Bank Identification Code (BIC)'
    },
    {
      class: 'String',
      name: 'website',
      width: 50
    },
    {
      class: 'String',
      name: 'businessType',
      width: 15
    },
    {
      class: 'String',
      name: 'businessSector',
      width: 15
    }
  ],

  methods: [
    function label() {
      return this.organization || ( this.firstName + this.lastName );
    }
  ]
});
