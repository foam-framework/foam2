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
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'created',
    'subject',
    'to',
    'from',
    'status'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      includeInDigest: true,
    },
    {
      class: 'DateTime',
      name: 'created',
      includeInDigest: true,
      tableWidth: 170
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'User who created the entry',
      includeInDigest: true,
    },
    {
      class: 'StringArray',
      name: 'to',
      includeInDigest: true,
    },
    {
      class: 'StringArray',
      name: 'cc',
      includeInDigest: true,
    },
    {
      class: 'StringArray',
      name: 'bcc',
      includeInDigest: true,
    },
    {
      class: 'String',
      name: 'subject',
      includeInDigest: true,
    },
    {
      class: 'String',
      name: 'body',
      includeInDigest: true,
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
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      includeInDigest: true,
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
      includeInDigest: true,
      value: null
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
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
      tableWidth: 100
    },
    {
      class: 'Map',
      name: 'templateArguments',
      includeInDigest: true,
      view: { class: 'foam.u2.view.MapView' }
    }
  ]
});
