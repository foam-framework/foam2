/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.notification.email',
  name: 'EmailService',

  methods: [
    {
      name: 'sendEmail',
      async: true,
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage'
        }
      ]
    },
    {
      name: 'sendEmailFromTemplate',
      async: true,
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User',
          documentation: 'User sending the email'
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage',
          documentation: 'Email message'
        },
        {
          name: 'name',
          type: 'String',
          documentation: 'Template name'
        },
        {
          name: 'templateArgs',
          type: 'Map',
          javaType: 'java.util.Map<String, Object>',
          documentation: 'Template arguments'
        }
      ]
    }
  ]
});
