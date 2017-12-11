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
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Address'
  ],

  documentation: '',

  tableColumns: [
    'id', 'enabled', 'type', 'group', 'firstName', 'lastName', 'organization', 'email'
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
      width: 175,
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
      width: 200,
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
      factory: function() { return this.Phone.create(); },
      view: 'foam.nanos.auth.PhoneDetailView'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile',
      factory: function() { return this.Phone.create(); },
      view: 'foam.nanos.auth.PhoneDetailView'
    },
    {
      class: 'String',
      name: 'type',
      tableWidth: 91,
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [ 'Personal', 'Business', 'Merchant', 'Broker', 'Bank' ]
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
      factory: function() { return this.Address.create(); },
      view: 'foam.nanos.auth.AddressDetailView'
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
      width: 35,
      documentation: 'Business Identification Number (BIN)'
    },
    {
      class: 'String',
      name: 'issuingAuthority',
      width: 35
    },
    {
      class: 'String',
      name: 'bankIdentificationCode',
      width: 20,
      documentation: 'Bank Identification Code (BIC)'
    },
    {
      class: 'URL',
      name: 'website',
      width: 2048
    }
  ],

  methods: [
    function label() {
      return this.organization || ( this.firstName + this.lastName );
    }
  ]
});
