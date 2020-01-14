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
    },
    {
      class: 'DateTime',
      name: 'created',
      tableWidth: 170
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the entry',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'User who created the entry',
    },
    {
      class: 'StringArray',
      name: 'to'
    },
    {
      class: 'StringArray',
      name: 'cc',
    },
    {
      class: 'StringArray',
      name: 'bcc'
    },
    {
      class: 'String',
      name: 'subject'
    },
    {
      class: 'String',
      name: 'body',
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
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
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
      tableWidth: 100
    },
  ]
});
