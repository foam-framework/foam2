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

  sections: [
    {
      name: 'emailInformation',
      order: 1
    },
    {
      name: 'templateInformation',
      label: 'Template Arguments',
      order: 2
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      section: 'emailInformation'
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'emailInformation',
      tableWidth: 170
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'emailInformation',
      documentation: 'User who created the entry',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'emailInformation',
      documentation: 'User who created the entry',
    },
    {
      class: 'StringArray',
      name: 'to',
      section: 'emailInformation'
    },
    {
      class: 'StringArray',
      name: 'cc',
      section: 'emailInformation'
    },
    {
      class: 'StringArray',
      name: 'bcc',
      section: 'emailInformation'
    },
    {
      class: 'String',
      name: 'subject',
      section: 'emailInformation'
    },
    {
      class: 'String',
      name: 'body',
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
      section: 'emailInformation',
      value: null
    },
    {
      class: 'String',
      name: 'displayName',
      section: 'emailInformation',
      value: null
    },
    {
      class: 'String',
      name: 'replyTo',
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
      section: 'emailInformation',
      tableWidth: 100
    },
    {
      class: 'Map',
      name: 'templateArguments',
      section: 'templateInformation',
      view: { class: 'foam.u2.view.MapView' }
    }
  ]
});
