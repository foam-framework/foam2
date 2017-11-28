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
      javaReturns: 'void',
      returns: 'Promise',
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage'
        }
      ]
    },
    {
      name: 'sendEmailFromTemplate',
      javaReturns: 'void',
      returns: 'Promise',
      args: [
        {
          name: 'emailMessage',
          javaType: 'foam.nanos.notification.email.EmailMessage',
          documentation: 'Email message'
        },
        {
          name: 'name',
          javaType: 'String',
          documentation: 'Template name'
        },
        {
          name: 'templateArgs',
          javaType: 'java.util.Map<String, Object>',
          documentation: 'Template arguments'
        }
      ]
    }
  ]
});