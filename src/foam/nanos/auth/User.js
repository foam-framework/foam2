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
    'id', 'enabled', 'firstName', 'lastName', 'organization', 'lastModified', 'profilePicture'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      max: 999
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
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'middleName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'organization'
    },
    {
      class: 'String',
      name: 'department'
    },
    {
      class: 'EMail',
      name: 'email',
      javaSetter:
`email_ = val.toLowerCase();
emailIsSet_ = true;`
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'mobile'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'DateTime',
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
      name: 'address'
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'accounts'
    },
    {
      class: 'Reference',
      name: 'language',
      of: 'foam.nanos.auth.Language',
      value: 'en'
    },
    {
      class: 'String',
      name: 'timeZone'
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
    },
    // TODO: remove after demo
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Name of the business'
    },
    {
      class: 'String',
      name: 'businessIdentificationNumber',
      documentation: 'Business Identification Number (BIN)'
    },
    {
      class: 'String',
      name: 'bankIdentificationCode',
      documentation: 'Bank Identification Code (BIC)'
    },
    {
      class: 'String',
      name: 'website'
    },
    {
      class: 'String',
      name: 'businessType'
    },
    {
      class: 'String',
      name: 'businessSector'
    },
  ],

  methods: [
    function label() {
      return this.organization || ( this.firstName + this.lastName );
    }
  ]
});
