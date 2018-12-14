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
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
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
      name: 'body'
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
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // TODO: Add authorization logic.
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

        if (
          ! user.getSystem() &&
          ! SafetyUtil.equals(user.getGroup(), "admin")
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
        // TODO: Add authorization logic.
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
        // TODO: Add authorization logic.
      `
    }
  ]
});
