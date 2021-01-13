/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailMessage',

  documentation: 'Email message',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  tableColumns: [
    'created',
    'subject',
    'to',
    'from',
    'status'
  ],

  sections: [
    {
      name: 'emailInformation',
      order: 1
    },
    {
      name: 'templateInformation',
      title: 'Template Arguments',
      order: 2
    },
    {
      name: 'systemInformation',
      help: 'Properties that are used internally by the system.',
      title: 'System Information',
      order: 3,
      permissionRequired: true
    },
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      includeInDigest: true,
      section: 'emailInformation'
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      section: 'emailInformation',
      tableWidth: 170
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'emailInformation',
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'emailInformation',
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'StringArray',
      name: 'to',
      includeInDigest: true,
      section: 'emailInformation'
    },
    {
      class: 'StringArray',
      name: 'cc',
      includeInDigest: true,
      section: 'emailInformation'
    },
    {
      class: 'StringArray',
      name: 'bcc',
      includeInDigest: true,
      section: 'emailInformation'
    },
    {
      class: 'String',
      name: 'subject',
      includeInDigest: true,
      section: 'emailInformation'
    },
    {
      class: 'String',
      name: 'body',
      includeInDigest: true,
      section: 'emailInformation',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.HTMLView' },
          { class: 'foam.u2.tag.TextArea', rows: 30, cols: 130 }
        ]
      }
    },
    {
      class: 'String',
      name: 'from',
      includeInDigest: true,
      section: 'emailInformation',
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      includeInDigest: true,
      section: 'emailInformation',
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
      includeInDigest: true,
      section: 'emailInformation',
      value: null
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'emailInformation',
      value: '1',
      transient: true,
      hidden: true,
      documentation: 'Added to suppress journal comments regarding "modified by". Also, a non-null value is required.',
      javaFactory: 'return 1L;'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.notification.email.Status',
      name: 'status',
      includeInDigest: false,
      section: 'emailInformation',
      tableWidth: 100
    },
    {
      class: 'Map',
      name: 'templateArguments',
      includeInDigest: true,
      section: 'templateInformation',
      view: { class: 'foam.u2.view.MapView' }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      tableWidth: 120,
      section: 'systemInformation',
      writePermissionRequired: true,
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
    }
  ]
});
